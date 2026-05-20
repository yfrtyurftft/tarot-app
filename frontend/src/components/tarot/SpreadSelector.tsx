'use client'
// ============================================================
// components/tarot/SpreadSelector.tsx — 牌陣選擇元件
// 用於「是否塔羅」與「感情塔羅」模式，讓使用者手動選擇牌陣
// ============================================================

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { fetchSpreads } from '@/lib/api'
import type { SpreadLayout, TarotMode } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

interface SpreadSelectorProps {
  mode: TarotMode
}

// 牌數對應的視覺顏色
const CARD_COUNT_COLOR: Record<number, string> = {
  1:  'text-amber-300',
  3:  'text-violet-300',
  5:  'text-blue-300',
  6:  'text-cyan-300',
  7:  'text-green-300',
  10: 'text-rose-300',
  12: 'text-orange-300',
}

export function SpreadSelector({ mode }: SpreadSelectorProps) {
  const { setSelectedSpread, nextStep } = useTarotStore()
  const [spreads, setSpreads] = useState<SpreadLayout[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  // 從 API 載入對應模式的牌陣
  useEffect(() => {
    fetchSpreads(mode)
      .then(setSpreads)
      .finally(() => setLoading(false))
  }, [mode])

  const handleSelect = (spread: SpreadLayout) => {
    setSelected(spread.id)
    setSelectedSpread(spread)
    setTimeout(() => nextStep(), 350)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-white/50 animate-pulse">{zhTW.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gradient-gold mb-2">
          {zhTW.spread.title}
        </h2>
        <p className="text-white/50 text-sm">{zhTW.spread.subtitle}</p>
      </motion.div>

      {/* 牌陣卡片列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {spreads.map((spread, i) => {
          const isSelected = selected === spread.id
          const countColor = CARD_COUNT_COLOR[spread.card_count] ?? 'text-white'

          return (
            <motion.button
              key={spread.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(spread)}
              className={`
                glass-card rounded-xl p-4 text-left cursor-pointer
                border transition-all duration-200
                ${isSelected
                  ? 'border-violet-400 bg-violet-900/30 glow-purple'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/5'}
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* 牌陣名稱 */}
                  <h3 className="text-white font-semibold text-base mb-1">
                    {spread.name_zh}
                  </h3>
                  {/* 描述 */}
                  <p className="text-white/50 text-xs leading-relaxed">
                    {spread.description_zh}
                  </p>
                </div>

                {/* 牌數標籤 */}
                <div className="flex-shrink-0 text-right">
                  <span className={`text-2xl font-bold ${countColor}`}>
                    {spread.card_count}
                  </span>
                  <p className="text-white/30 text-xs">{zhTW.spread.cards}</p>
                </div>
              </div>

              {/* 位置標籤預覽（最多顯示 4 個）*/}
              <div className="mt-3 flex flex-wrap gap-1">
                {spread.positions.slice(0, 4).map((pos) => (
                  <span
                    key={pos.key}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60"
                  >
                    {pos.label_zh}
                  </span>
                ))}
                {spread.positions.length > 4 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                    +{spread.positions.length - 4}
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
