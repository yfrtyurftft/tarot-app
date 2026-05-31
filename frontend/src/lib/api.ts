// ============================================================
// lib/api.ts — API 呼叫封裝（含 SSE 串流版本）
// ============================================================

import type {
  DrawnCard, Persona, SpreadLayout, TarotCard,
  RecommendSpreadResponse, TarotMode,
} from '@/types/tarot'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

export async function fetchPersonas(): Promise<Persona[]> {
  return apiFetch<Persona[]>('/api/personas')
}

export async function fetchSpreads(mode: TarotMode | 'all' = 'all'): Promise<SpreadLayout[]> {
  return apiFetch<SpreadLayout[]>(`/api/spreads?mode=${mode}`)
}

export async function fetchCards(): Promise<TarotCard[]> {
  return apiFetch<TarotCard[]>('/api/cards')
}

export async function drawCards(spreadId: string): Promise<{ cards: DrawnCard[] }> {
  return apiFetch<{ cards: DrawnCard[] }>('/api/draw', {
    method: 'POST',
    body: JSON.stringify({ spread_id: spreadId }),
  })
}

export async function recommendSpread(
  question: string,
  personaId: string
): Promise<RecommendSpreadResponse> {
  return apiFetch<RecommendSpreadResponse>('/api/recommend-spread', {
    method: 'POST',
    body: JSON.stringify({ question, persona_id: personaId }),
  })
}

// ── SSE 串流：AI 解讀 ─────────────────────────────────────
export async function interpretCardsStream(params: {
  question: string
  personaId: string
  cards: DrawnCard[]
  mode: TarotMode
  spreadId: string
}, callbacks: {
  onSession: (sessionId: string) => void  // 收到 session_id 時
  onText:    (text: string) => void        // 每個文字片段
  onDone:    () => void                    // 完成
  onError:   (err: Error) => void          // 錯誤
}): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/interpret/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question:   params.question,
        persona_id: params.personaId,
        cards:      params.cards,
        mode:       params.mode,
        spread_id:  params.spreadId,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API 錯誤：${res.status}`)
    }

    await parseSSEStream(res, callbacks)
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  }
}

// ── SSE 串流：聊天 ────────────────────────────────────────
export async function sendChatMessageStream(params: {
  sessionId:  string
  message:    string
  personaId:  string
}, callbacks: {
  onText:  (text: string) => void
  onDone:  () => void
  onError: (err: Error) => void
}): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: params.sessionId,
        message:    params.message,
        persona_id: params.personaId,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `API 錯誤：${res.status}`)
    }

    await parseSSEStream(res, {
      onSession: () => {},
      onText:    callbacks.onText,
      onDone:    callbacks.onDone,
      onError:   callbacks.onError,
    })
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  }
}

// ── 共用：解析 SSE 串流 ───────────────────────────────────
async function parseSSEStream(
  res: Response,
  callbacks: {
    onSession: (sessionId: string) => void
    onText:    (text: string) => void
    onDone:    () => void
    onError:   (err: Error) => void
  }
): Promise<void> {
  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer    = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''   // 保留未完成的行

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const dataStr = line.slice(6).trim()
      if (!dataStr) continue

      try {
        const data = JSON.parse(dataStr)
        if (data.type === 'session') {
          callbacks.onSession(data.session_id)
        } else if (data.type === 'text') {
          callbacks.onText(data.text)
        } else if (data.type === 'done') {
          callbacks.onDone()
        }
      } catch {
        // 忽略解析錯誤
      }
    }
  }
}
