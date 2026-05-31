// ============================================================
// lib/api.ts — API 呼叫封裝（SSE + 型別完整修正版）
// ============================================================

import type {
  DrawnCard,
  Persona,
  SpreadLayout,
  TarotCard,
  RecommendSpreadResponse,
  TarotMode,
} from '@/types/tarot'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ============================================================
// REST wrapper（🟢 FIX：所有 API 都強制有型別）
// ============================================================
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API 錯誤：${res.status}`)
  }

  return res.json() as Promise<T>
}

// ============================================================
// APIs（🟢 FIX：全部補回傳型別，避免 unknown）
// ============================================================

export async function fetchPersonas(): Promise<Persona[]> {
  return apiFetch<Persona[]>('/api/personas')
}

export async function fetchSpreads(
  mode: TarotMode | 'all' = 'all'
): Promise<SpreadLayout[]> {
  return apiFetch<SpreadLayout[]>(`/api/spreads?mode=${mode}`)
}

export async function fetchCards(): Promise<TarotCard[]> {
  return apiFetch<TarotCard[]>('/api/cards')
}

export async function drawCards(
  spreadId: string
): Promise<{ cards: DrawnCard[] }> {
  return apiFetch<{ cards: DrawnCard[] }>('/api/draw', {
    method: 'POST',
    body: JSON.stringify({ spread_id: spreadId }),
  })
}

// ============================================================
// 🔴 FIX（你 Vercel error 的真正來源）
// ============================================================
export async function recommendSpread(
  question: string,
  personaId: string
): Promise<RecommendSpreadResponse> {
  return apiFetch<RecommendSpreadResponse>('/api/recommend-spread', {
    method: 'POST',
    body: JSON.stringify({
      question,
      persona_id: personaId,
    }),
  })
}

// ============================================================
// 🟢 SSE — Interpret Stream
// ============================================================
export async function interpretCardsStream(
  params: {
    question: string
    personaId: string
    cards: DrawnCard[]
    mode: TarotMode
    spreadId: string
  },
  callbacks: {
    onSession: (sessionId: string) => void
    onText: (text: string) => void
    onDone: () => void
    onError: (err: Error) => void
  }
) {
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

    if (!res.ok || !res.body) {
      throw new Error(`API 錯誤：${res.status}`)
    }

    await parseSSEStream(res, callbacks)
  } catch (e) {
    callbacks.onError(
      e instanceof Error ? e : new Error(String(e))
    )
  }
}

// ============================================================
// 🟢 SSE — Chat Stream
// ============================================================
export async function sendChatMessageStream(
  params: {
    sessionId: string
    message: string
    personaId: string
  },
  callbacks: {
    onText: (text: string) => void
    onDone: () => void
    onError: (err: Error) => void
  }
) {
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

    if (!res.ok || !res.body) {
      throw new Error(`API 錯誤：${res.status}`)
    }

    await parseSSEStream(res, {
      onSession: () => {},
      onText: callbacks.onText,
      onDone: callbacks.onDone,
      onError: callbacks.onError,
    })
  } catch (e) {
    callbacks.onError(
      e instanceof Error ? e : new Error(String(e))
    )
  }
}

// ============================================================
// 🔥 SSE Parser（🟢 FIX：穩定 Vercel + 不會斷字）
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

    // 🔴 FIX 1：SSE 正確 event boundary
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const lines = event.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data:')) continue

        const raw = line.slice(5).trim()
        if (!raw) continue

        try {
          const data = JSON.parse(raw)

          // 🟢 FIX 2：完整 event handling
          switch (data.type) {
            case 'session':
              callbacks.onSession(data.session_id)
              break

            case 'text':
              callbacks.onText(data.text)
              break

            case 'done':
              callbacks.onDone()
              break
          }
        } catch (err) {
          // 🟡 不 crash build，但 log debug
          console.warn('SSE parse error:', raw)
        }
      }
    }
  }
}