// ============================================================
// lib/api.ts — 所有後端 API 呼叫封裝
// 對應 backend/main.py 的所有端點
// ============================================================

import type {
  DrawnCard,
  Persona,
  SpreadLayout,
  TarotCard,
  RecommendSpreadResponse,
  InterpretResponse,
  ChatResponse,
  TarotMode,
} from '@/types/tarot'

// 後端基礎 URL（從環境變數讀取）
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ── 通用 fetch 包裝（統一錯誤處理）──────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API 錯誤：${res.status}`)
  }
  return res.json()
}

// ── 1. 取得占卜師人設清單 ─────────────────────────────────
export async function fetchPersonas(): Promise<Persona[]> {
  return apiFetch<Persona[]>('/api/personas')
}

// ── 2. 取得牌陣清單 ───────────────────────────────────────
export async function fetchSpreads(mode: TarotMode | 'all' = 'all'): Promise<SpreadLayout[]> {
  return apiFetch<SpreadLayout[]>(`/api/spreads?mode=${mode}`)
}

// ── 3. 取得完整牌庫 ───────────────────────────────────────
export async function fetchCards(): Promise<TarotCard[]> {
  return apiFetch<TarotCard[]>('/api/cards')
}

// ── 4. 抽卡 ──────────────────────────────────────────────
export async function drawCards(spreadId: string): Promise<{ cards: DrawnCard[] }> {
  return apiFetch<{ cards: DrawnCard[] }>('/api/draw', {
    method: 'POST',
    body: JSON.stringify({ spread_id: spreadId }),
  })
}

// ── 5. AI 推薦牌陣（AI 塔羅模式專用）────────────────────
export async function recommendSpread(
  question: string,
  personaId: string
): Promise<RecommendSpreadResponse> {
  return apiFetch<RecommendSpreadResponse>('/api/recommend-spread', {
    method: 'POST',
    body: JSON.stringify({ question, persona_id: personaId }),
  })
}

// ── 6. AI 解讀抽卡結果 ─────────────────────────────────
export async function interpretCards(params: {
  question: string
  personaId: string
  cards: DrawnCard[]
  mode: TarotMode
  spreadId: string
}): Promise<InterpretResponse> {
  return apiFetch<InterpretResponse>('/api/interpret', {
    method: 'POST',
    body: JSON.stringify({
      question: params.question,
      persona_id: params.personaId,
      cards: params.cards,
      mode: params.mode,
      spread_id: params.spreadId,
    }),
  })
}

// ── 7. 聊天延續 ──────────────────────────────────────────
export async function sendChatMessage(params: {
  sessionId: string
  message: string
  personaId: string
}): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      session_id: params.sessionId,
      message: params.message,
      persona_id: params.personaId,
    }),
  })
}
