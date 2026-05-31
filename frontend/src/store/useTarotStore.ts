// ============================================================
// store/useTarotStore.ts — Zustand 全域狀態管理
// 新增：isStreaming、appendInterpretation 供 SSE 串流使用
// ============================================================

import { create } from 'zustand'
import type {
  Step, TarotMode, SpreadLayout, Persona,
  DrawnCard, ChatMessage, RecommendSpreadResponse, TarotCard,
} from '@/types/tarot'

export const MODE_STEPS: Record<TarotMode, Step[]> = {
  ai:    ['INPUT_QUESTION', 'SELECT_PERSONA', 'CONFIRM_SPREAD', 'DRAW', 'RESULT', 'CHAT'],
  yesno: ['SELECT_SPREAD',  'SELECT_PERSONA', 'INPUT_QUESTION', 'DRAW', 'RESULT', 'CHAT'],
  love:  ['SELECT_SPREAD',  'SELECT_PERSONA', 'INPUT_QUESTION', 'DRAW', 'RESULT', 'CHAT'],
  daily: ['SELECT_PERSONA', 'DRAW', 'RESULT', 'CHAT'],
}

interface TarotState {
  mode: TarotMode
  step: Step

  selectedSpread: SpreadLayout | null
  selectedPersona: Persona | null
  drawnCards: DrawnCard[]
  question: string

  recommendedSpread: RecommendSpreadResponse | null
  isLoadingRecommend: boolean

  interpretation: string
  sessionId: string
  isLoadingInterpret: boolean
  isStreaming: boolean

  chatHistory: ChatMessage[]
  isChatLoading: boolean

  cardCache: Record<string, TarotCard>

  setMode: (mode: TarotMode) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: Step) => void

  setSelectedSpread: (spread: SpreadLayout) => void
  setSelectedPersona: (persona: Persona) => void
  setQuestion: (question: string) => void
  setDrawnCards: (cards: DrawnCard[]) => void

  setRecommendedSpread: (data: RecommendSpreadResponse | null) => void
  setIsLoadingRecommend: (loading: boolean) => void

  setInterpretation: (text: string, sessionId: string) => void
  clearInterpretation: () => void
  appendInterpretation: (text: string) => void

  setSessionId: (id: string) => void
  setIsLoadingInterpret: (loading: boolean) => void
  setIsStreaming: (streaming: boolean) => void

  addChatMessage: (msg: ChatMessage) => void
  setIsChatLoading: (loading: boolean) => void

  setCardCache: (cards: TarotCard[]) => void
  reset: () => void
}

const MODE_STEPS_MAP = MODE_STEPS

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
  isStreaming: false,
  chatHistory: [],
  isChatLoading: false,
  cardCache: {},
}

export const useTarotStore = create<TarotState>((set, get) => ({
  ...INITIAL_STATE,

  setMode: (mode) =>
    set({
      ...INITIAL_STATE,
      mode,
      step: MODE_STEPS_MAP[mode][0],
      cardCache: get().cardCache,
    }),

  nextStep: () => {
    const { mode, step } = get()
    const steps = MODE_STEPS_MAP[mode]
    const i = steps.indexOf(step)
    if (i < steps.length - 1) set({ step: steps[i + 1] })
  },

  prevStep: () => {
    const { mode, step } = get()
    const steps = MODE_STEPS_MAP[mode]
    const i = steps.indexOf(step)
    if (i > 0) set({ step: steps[i - 1] })
  },

  goToStep: (step) => set({ step }),

  setSelectedSpread: (spread) => set({ selectedSpread: spread }),
  setSelectedPersona: (persona) => set({ selectedPersona: persona }),
  setQuestion: (q) => set({ question: q }),
  setDrawnCards: (cards) => set({ drawnCards: cards }),

  setRecommendedSpread: (data) => set({ recommendedSpread: data }),
  setIsLoadingRecommend: (loading) => set({ isLoadingRecommend: loading }),

  setInterpretation: (text, sessionId) =>
    set({ interpretation: text, sessionId }),

  clearInterpretation: () => set({ interpretation: '' }),

  appendInterpretation: (text) =>
    set((state) => ({
      interpretation: state.interpretation + text,
    })),

  setSessionId: (id) => set({ sessionId: id }),
  setIsLoadingInterpret: (loading) => set({ isLoadingInterpret: loading }),
  setIsStreaming: (s) => set({ isStreaming: s }),

  addChatMessage: (msg) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, msg],
    })),

  setIsChatLoading: (loading) => set({ isChatLoading: loading }),

  setCardCache: (cards) =>
    set({
      cardCache: Object.fromEntries(cards.map((c) => [c.id, c])),
    }),

  reset: () =>
    set((state) => ({
      ...INITIAL_STATE,
      mode: state.mode,
      step: MODE_STEPS_MAP[state.mode][0],
      cardCache: state.cardCache,
    })),
}))
