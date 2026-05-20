'use client'
// ============================================================
// CardSpread.tsx — 牌陣佈局展示（動態根據牌數縮放）
// 1張：超大  3張：大  5-7張：中  10張：正常  12張：小
// ============================================================

import { motion } from 'framer-motion'
import type { DrawnCard, TarotCard, SpreadLayout } from '@/types/tarot'

interface CardSpreadProps {
  spread: SpreadLayout
  drawnCards: DrawnCard[]
  cardCache: Record<string, TarotCard>
}

// 根據牌數決定卡片尺寸
function getCardSize(count: number): { w: number; h: number } {
  if (count === 1)       return { w: 200, h: 320 }
  if (count <= 3)        return { w: 140, h: 224 }
  if (count <= 5)        return { w: 108, h: 173 }
  if (count <= 7)        return { w: 90,  h: 144 }
  if (count <= 10)       return { w: 76,  h: 122 }
  return                        { w: 64,  h: 102 }
}

// 根據牌數決定容器尺寸（讓容器剛好包住牌陣）
function getContainerSize(count: number): { w: number; h: number } {
  if (count === 1)  return { w: 240, h: 360 }
  if (count <= 3)   return { w: 560, h: 280 }
  if (count <= 5)   return { w: 580, h: 340 }
  if (count <= 7)   return { w: 620, h: 380 }
  if (count <= 10)  return { w: 640, h: 400 }
  return                   { w: 680, h: 420 }
}

export function CardSpread({ spread, drawnCards, cardCache }: CardSpreadProps) {
  const count = drawnCards.length
  const { w: cardW, h: cardH } = getCardSize(count)
  const { w: containerW, h: containerH } = getContainerSize(count)

  // 將 -1~1 的相對座標轉換為像素（以容器中心為原點）
  const toX = (v: number) => containerW / 2 + v * (containerW / 2 - cardW / 2 - 4)
  const toY = (v: number) => containerH / 2 + v * (containerH / 2 - cardH / 2 - 8)

  return (
    <div
      className="mx-auto relative"
      style={{ width: containerW, height: containerH, maxWidth: '100%' }}
    >
      {drawnCards.map((drawn, i) => {
        const pos = drawn.position
        const card = cardCache[drawn.card_id]
        const cx = toX(pos.x)
        const cy = toY(pos.y)
        // 凱爾特十字陣第2張（challenge）橫放
        const extraRotation = pos.key === 'challenge' ? 90 : 0
        const totalRotation = (pos.rotation ?? 0) + extraRotation

        return (
          <motion.div
            key={pos.key}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 160 }}
            className="absolute"
            style={{
              left: cx - cardW / 2,
              top: cy - cardH / 2,
              width: cardW,
              height: cardH,
              zIndex: i + 1,
              transform: `rotate(${totalRotation}deg)`,
            }}
          >
            {/* 卡片本體 */}
            <div
              className="relative w-full h-full rounded-xl overflow-hidden shadow-lg"
              style={{
                transform: drawn.is_reversed ? 'rotate(180deg)' : undefined,
                border: '1.5px solid rgba(139,92,246,0.5)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {card ? (
                <img
                  src={card.image}
                  alt={card.name_zh}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-violet-900/50 flex items-center justify-center">
                  <span className="text-white/40 text-xs">載入中</span>
                </div>
              )}

              {/* 逆位標記 */}
              {drawn.is_reversed && (
                <div className="absolute top-1 right-1 bg-rose-500/80 rounded px-1 text-[9px] text-white font-bold">
                  逆
                </div>
              )}
            </div>

            {/* 位置標籤（卡片下方）*/}
            <div
              className="absolute -bottom-6 left-1/2 whitespace-nowrap"
              style={{ transform: `translateX(-50%) rotate(${-totalRotation}deg)` }}
            >
              <span className="text-[11px] text-white/60 bg-black/50 px-2 py-0.5 rounded-full">
                {pos.label_zh}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
