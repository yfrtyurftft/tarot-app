'use client'
// ============================================================
// components/tarot/PersonaSelector.tsx — 占卜師選擇元件
// 顯示三位人設卡片，點選後切換背景主題並進入下一步
// ============================================================

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { fetchPersonas } from '@/lib/api'
import type { Persona } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

// 每個人設的視覺設定
const PERSONA_VISUALS: Record<string, { emoji: string; gradient: string; accent: string }> = {
  mystic_witch:     { emoji: '🌙', gradient: 'from-violet-900/80 to-indigo-900/80', accent: 'border-violet-400' },
  rational_analyst: { emoji: '📊', gradient: 'from-slate-800/80 to-blue-900/80',   accent: 'border-blue-400'   },
  gentle_healer:    { emoji: '🌸', gradient: 'from-rose-900/80 to-pink-900/80',    accent: 'border-pink-400'   },
}

export function PersonaSelector() {
  const { setSelectedPersona, nextStep } = useTarotStore()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  // 從 API 載入人設清單
  useEffect(() => {
    fetchPersonas()
      .then(setPersonas)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = (persona: Persona) => {
    setSelected(persona.id)
    setSelectedPersona(persona)
    // 短暫延遲讓動畫播放後再進入下一步
    setTimeout(() => nextStep(), 400)
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
          {zhTW.persona.title}
        </h2>
        <p className="text-white/50 text-sm">{zhTW.persona.subtitle}</p>
      </motion.div>

      {/* 人設卡片列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {personas.map((persona, i) => {
          const visual = PERSONA_VISUALS[persona.id] ?? {
            emoji: '🔮',
            gradient: 'from-gray-800/80 to-gray-900/80',
            accent: 'border-gray-400',
          }
          const isSelected = selected === persona.id

          return (
            <motion.button
              key={persona.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(persona)}
              className={`
                glass-card rounded-2xl p-6 text-left cursor-pointer
                bg-gradient-to-br ${visual.gradient}
                border-2 transition-all duration-300
                ${isSelected
                  ? `${visual.accent} glow-purple`
                  : 'border-white/10 hover:border-white/30'}
              `}
            >
              {/* 人設大頭貼 */}
              <div className="text-5xl mb-4 text-center">{visual.emoji}</div>

              {/* 人設名稱 */}
              <h3 className="text-lg font-bold text-white text-center mb-3">
                {persona.name}
              </h3>

              {/* 風格說明 */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-white/40 text-xs">風格</span>
                  <p className="text-white/80 mt-0.5">{persona.style}</p>
                </div>
                <div>
                  <span className="text-white/40 text-xs">語氣</span>
                  <p className="text-white/60 mt-0.5 text-xs">{persona.tone}</p>
                </div>
              </div>

              {/* 選中標記 */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 flex justify-center"
                >
                  <span className="text-2xl">✓</span>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
