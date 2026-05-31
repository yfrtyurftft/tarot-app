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
  return apiFetch('/api/personas')
}

export async function fetchSpreads(mode: TarotMode | 'all' = 'all'): Promise<SpreadLayout[]> {
  return apiFetch(`/api/spreads?mode=${mode}`)
}

export async function fetchCards(): Promise<TarotCard[]> {
  return apiFetch('/api/cards')
}

export async function drawCards(spreadId: string) {
  return apiFetch('/api/draw', {
    method: 'POST',
    body: JSON.stringify({ spread_id: spreadId }),
  })
}

export async function recommendSpread(question: string, personaId: string) {
  return apiFetch('/api/recommend-spread', {
    method: 'POST',
    body: JSON.stringify({ question, persona_id: personaId }),
  })
}

// ============================================================
// 🟢 SSE interpret（修正核心）
// ============================================================
export async function interpretCardsStream(params: {
  question: string
  personaId: string
  cards: DrawnCard[]
  mode: TarotMode
  spreadId: string
}, callbacks: {
  onSession: (sessionId: string) => void
  onText: (text: string) => void
  onDone: () => void
  onError: (err: Error) => void
}) {
  try {
    const res = await fetch(`${API_BASE}/api/interpret/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: params.question,
        persona_id: params.personaId,
        cards: params.cards,
        mode: params.mode,
        spread_id: params.spreadId,
      }),
    })

    if (!res.ok) {
      throw new Error(`API 錯誤：${res.status}`)
    }

    await parseSSEStream(res, callbacks)
  } catch (e) {
    callbacks.onError(e instanceof Error ? e : new Error(String(e)))
  }
}

// ============================================================
// 🟢 SSE chat
// ============================================================
export async function sendChatMessageStream(params: {
  sessionId: string
  message: string
  personaId: string
}, callbacks: {
  onText: (text: string) => void
  onDone: () => void
  onError: (err: Error) => void
}) {
  try {
    const res = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: params.sessionId,
        message: params.message,
        persona_id: params.personaId,
      }),
    })

    if (!res.ok) {
      throw new Error(`API 錯誤：${res.status}`)
    }

    await parseSSEStream(res, {
      onSession: () => {},
      onText: callbacks.onText,
      onDone: callbacks.onDone,
      onError: callbacks.onError,
    })
  } catch (e) {
    callbacks.onError(e instanceof Error ? e : new Error(String(e)))
  }
}

// ============================================================
// 🔥 FIX：SSE parser（你 bug 的核心修正）
// ============================================================
async function parseSSEStream(
  res: Response,
  callbacks: {
    onSession: (sessionId: string) => void
    onText: (text: string) => void
    onDone: () => void
    onError: (err: Error) => void
  }
) {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // 🔧 FIX 1：用 SSE event boundary，而不是 line split
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const lines = event.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data:')) continue

        const raw = line.replace('data:', '').trim()
        if (!raw) continue

        try {
          const data = JSON.parse(raw)

          if (data.type === 'session') {
            callbacks.onSession(data.session_id)
          }

          if (data.type === 'text') {
            callbacks.onText(data.text)
          }

          if (data.type === 'done') {
            callbacks.onDone()
          }

        } catch (err) {
          // 🔧 FIX 2：不要 silent fail（你原本會直接吃掉錯誤）
          console.warn('SSE parse error:', raw)
        }
      }
    }
  }
}
