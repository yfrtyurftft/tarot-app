// ============================================================
// store/useTarotStore.ts — Zustand 全域狀態管理
// 管理占卜流程的所有狀態，含各模式的 Step 流程控制
// ============================================================

import { create } from 'zustand'
import type {
  Step,
  TarotMode,
  SpreadLayout,
  Persona,
  DrawnCard,
  ChatMessage,
  RecommendSpreadResponse,
  TarotCard,
} from '@/types/tarot'

// ── 每個模式的標準 Step 流程 ──────────────────────────────
// AI 塔羅：輸入問題 → 選人設 → AI推薦牌陣 → 確認牌陣 → 抽卡 → 結果 → 聊天
// 是否/感情：選牌陣 → 選人設 → 輸入問題 → 抽卡 → 結果 → 聊天
// 今日運勢：選人設 → 抽卡 → 結果 → 聊天（不需問題）
export const MODE_STEPS: Record<TarotMode, Step[]> = {
  ai:     ['INPUT_QUESTION', 'SELECT_PERSONA', 'CONFIRM_SPREAD', 'DRAW', 'RESULT', 'CHAT'],
  yesno:  ['SELECT_SPREAD',  'SELECT_PERSONA', 'INPUT_QUESTION', 'DRAW', 'RESULT', 'CHAT'],
  love:   ['SELECT_SPREAD',  'SELECT_PERSONA', 'INPUT_QUESTION', 'DRAW', 'RESULT', 'CHAT'],
  daily:  ['SELECT_PERSONA', 'DRAW', 'RESULT', 'CHAT'],
}

// ── Store 狀態型別 ────────────────────────────────────────
interface TarotState {
  // 當前模式與步驟
  mode: TarotMode
  step: Step

  // 占卜相關狀態
  selectedSpread: SpreadLayout | null
  selectedPersona: Persona | null
  drawnCards: DrawnCard[]
  question: string

  // AI 推薦牌陣（AI 塔羅模式專用）
  recommendedSpread: RecommendSpreadResponse | null
  isLoadingRecommend: boolean

  // AI 解讀結果
  interpretation: string
  sessionId: string
  isLoadingInterpret: boolean

  // 聊天視窗
  chatHistory: ChatMessage[]
  isChatLoading: boolean

  // 牌庫快取（從 API 載入後存入）
  cardCache: Record<string, TarotCard>

  // ── Actions ─────────────────────────────────────────────

  // 模式切換（重置所有狀態）
  setMode: (mode: TarotMode) => void

  // 步驟導航
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: Step) => void

  // 選擇狀態設定
  setSelectedSpread: (spread: SpreadLayout) => void
  setSelectedPersona: (persona: Persona) => void
  setQuestion: (question: string) => void
  setDrawnCards: (cards: DrawnCard[]) => void

  // AI 推薦牌陣（AI 塔羅模式）
  setRecommendedSpread: (data: RecommendSpreadResponse | null) => void
  setIsLoadingRecommend: (loading: boolean) => void

  // AI 解讀結果
  setInterpretation: (text: string, sessionId: string) => void
  setIsLoadingInterpret: (loading: boolean) => void

  // 聊天
  addChatMessage: (msg: ChatMessage) => void
  setIsChatLoading: (loading: boolean) => void

  // 牌庫快取
  setCardCache: (cards: TarotCard[]) => void

  // 重置（回到該模式初始狀態）
  reset: () => void
}

// ── 取得某模式的初始步驟 ──────────────────────────────────
const getInitialStep = (mode: TarotMode): Step => MODE_STEPS[mode][0]

// ── 初始狀態 ──────────────────────────────────────────────
const INITIAL_STATE = {
  mode: 'ai' as TarotMode,
  step: 'INPUT_QUESTION' as Step,
  selectedSpread: null,
  selectedPersona: null,
  drawnCards: [],
  question: '',
  recommendedSpread: null,
  isLoadingRecommend: false,
  interpretation: '',
  sessionId: '',
  isLoadingInterpret: false,
  chatHistory: [],
  isChatLoading: false,
  cardCache: {},
}

// ── Zustand Store ─────────────────────────────────────────
export const useTarotStore = create<TarotState>((set, get) => ({
  ...INITIAL_STATE,

  // 切換模式並重置所有狀態
  setMode: (mode) =>
    set({
      ...INITIAL_STATE,
      mode,
      step: getInitialStep(mode),
      cardCache: get().cardCache, // 保留牌庫快取
    }),

  // 前進到下一步驟
  nextStep: () => {
    const { mode, step } = get()
    const steps = MODE_STEPS[mode]
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      set({ step: steps[currentIndex + 1] })
    }
  },

  // 返回上一步驟
  prevStep: () => {
    const { mode, step } = get()
    const steps = MODE_STEPS[mode]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      set({ step: steps[currentIndex - 1] })
    }
  },

  // 直接跳到指定步驟
  goToStep: (step) => set({ step }),

  // 設定選擇的牌陣
  setSelectedSpread: (spread) => set({ selectedSpread: spread }),

  // 設定選擇的占卜師人設
  setSelectedPersona: (persona) => set({ selectedPersona: persona }),

  // 設定使用者問題
  setQuestion: (question) => set({ question }),

  // 設定抽到的牌
  setDrawnCards: (cards) => set({ drawnCards: cards }),

  // 設定 AI 推薦牌陣（AI 塔羅模式）
  setRecommendedSpread: (data) => set({ recommendedSpread: data }),
  setIsLoadingRecommend: (loading) => set({ isLoadingRecommend: loading }),

  // 設定 AI 解讀結果
  setInterpretation: (text, sessionId) =>
    set({ interpretation: text, sessionId }),
  setIsLoadingInterpret: (loading) => set({ isLoadingInterpret: loading }),

  // 新增聊天訊息
  addChatMessage: (msg) =>
    set((state) => ({ chatHistory: [...state.chatHistory, msg] })),

  // 設定聊天載入狀態
  setIsChatLoading: (loading) => set({ isChatLoading: loading }),

  // 設定牌庫快取（key 為 card.id）
  setCardCache: (cards) =>
    set({ cardCache: Object.fromEntries(cards.map((c) => [c.id, c])) }),

  // 重置（保留 mode 和 cardCache）
  reset: () =>
    set((state) => ({
      ...INITIAL_STATE,
      mode: state.mode,
      step: getInitialStep(state.mode),
      cardCache: state.cardCache,
    })),
}))
