'use client'
// ============================================================
// components/tarot/Preloader.tsx
// 放在 layout.tsx 中，app 一開啟就在背景執行：
// 1. 喚醒 Railway 後端（避免冷啟動等待）
// 2. 預載所有 78 張塔羅牌圖片到瀏覽器快取
// 使用者看不到這個元件，純背景作業
// ============================================================

import { useEffect } from 'react'
import { useTarotStore } from '@/store/useTarotStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function Preloader() {
  const setCardCache = useTarotStore(s => s.setCardCache)
  const cardCache    = useTarotStore(s => s.cardCache)

  useEffect(() => {
    // ── 1. 喚醒後端（Railway 冷啟動預防）──────────────────
    // 立即 ping /health，讓後端從睡眠中喚醒
    // 使用者在選占卜師的這段時間（約 10-20 秒）後端就能就緒
    fetch(`${API_BASE}/health`, { method: 'GET' })
      .catch(() => {
        // 靜默失敗，不影響使用者
      })

    // ── 2. 預載所有牌圖到瀏覽器快取 ──────────────────────
    if (Object.keys(cardCache).length > 0) return  // 已有快取則跳過

    fetch(`${API_BASE}/api/cards`)
      .then(r => r.json())
      .then((cards: Array<{ id: string; image: string; [key: string]: unknown }>) => {
        // 存入 Zustand store（供後續步驟直接使用，不需再 fetch）
        setCardCache(cards as any)

        // 同時把圖片預載到瀏覽器快取
        // 分批載入：每批 10 張，間隔 200ms，避免同時發 78 個請求
        const batchSize = 10
        cards.forEach((card, i) => {
          const batchIndex = Math.floor(i / batchSize)
          setTimeout(() => {
            const img = new window.Image()
            img.src = card.image
          }, batchIndex * 200)
        })
      })
      .catch(() => {
        // 靜默失敗
      })
  }, []) // eslint-disable-line

  // 這個元件不渲染任何 UI
  return null
}
