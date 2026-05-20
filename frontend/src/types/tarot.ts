// ============================================================
// types/tarot.ts — 前端 TypeScript 型別定義
// 與後端 models.py 完全對應
// ============================================================

// ── 塔羅牌 ────────────────────────────────────────────────
export type TarotCard = {
  id: string
  name_zh: string
  name_en: string
  meaning_upright: string
  meaning_reversed: string
  image: string
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
  number?: number
}

// ── 牌陣位置 ───────────────────────────────────────────────
export type CardPosition = {
  key: string
  label_zh: string
  label_en: string
  x: number  // -1 ~ 1
  y: number  // -1 ~ 1
  rotation?: number
}

// ── 牌陣佈局 ───────────────────────────────────────────────
export type SpreadLayout = {
  id: string
  name_zh: string
  name_en: string
  card_count: number
  positions: CardPosition[]
  mode: 'ai' | 'yesno' | 'love' | 'daily' | 'all'
  description_zh: string
}

// ── 已抽的牌 ───────────────────────────────────────────────
export type DrawnCard = {
  card_id: string
  is_reversed: boolean
  position: CardPosition
}

// ── 占卜師人設 ─────────────────────────────────────────────
export type Persona = {
  id: string
  name: string
  style: string
  tone: string
}

// ── 聊天訊息 ───────────────────────────────────────────────
export type ChatMessage = {
  role: 'user' | 'ai'
  content: string
  timestamp: number
}

// ── 流程步驟 ───────────────────────────────────────────────
export type Step =
  | 'SELECT_SPREAD'    // 選擇牌陣（或等待 AI 推薦）
  | 'SELECT_PERSONA'   // 選擇占卜師人設
  | 'INPUT_QUESTION'   // 輸入問題（AI 塔羅：問題 → AI 推薦牌陣）
  | 'CONFIRM_SPREAD'   // 確認 AI 推薦的牌陣（AI 塔羅專用）
  | 'DRAW'             // 抽卡互動
  | 'RESULT'           // 查看 AI 解讀
  | 'CHAT'             // 持續聊天

// ── 占卜模式 ───────────────────────────────────────────────
export type TarotMode = 'ai' | 'yesno' | 'love' | 'daily'

// ── API 請求 / 回應型別 ────────────────────────────────────

export type RecommendSpreadResponse = {
  spread_id: string
  spread_name: string
  explanation: string
}

export type InterpretResponse = {
  answer: string
  session_id: string
}

export type ChatResponse = {
  answer: string
}
