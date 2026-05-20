'use client'
// ============================================================
// app/daily/page.tsx — 今日運勢
// 流程：SELECT_PERSONA → DRAW → RESULT → CHAT
// 不需輸入問題，固定使用 daily-single 牌陣
// ============================================================

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { PersonaSelector } from '@/components/tarot/PersonaSelector'
import { CardDeck } from '@/components/tarot/CardDeck'
import { ResultView } from '@/components/tarot/ResultView'
import { ChatWindow } from '@/components/tarot/ChatWindow'
import { StepIndicator } from '@/components/tarot/StepIndicator'

export default function DailyPage() {
  const { mode, setMode, step, setSelectedSpread } = useTarotStore()

  useEffect(() => {
    if (mode !== 'daily') {
      setMode('daily')
    }
  }, [mode, setMode])

  // daily 模式固定使用單卡牌陣，預先載入牌陣資料
  useEffect(() => {
    import('@/lib/api').then(({ fetchSpreads }) => {
      fetchSpreads('daily').then((spreads) => {
        const daily = spreads.find((s) => s.id === 'daily-single')
        if (daily) setSelectedSpread(daily)
      })
    })
  }, [setSelectedSpread])

  return (
    <div className="min-h-screen py-8 px-4">
      {/* 頁面標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <p className="text-white/30 text-sm">每日一牌，感受今日能量</p>
      </motion.div>

      <StepIndicator mode="daily" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
        >
          {step === 'SELECT_PERSONA' && <PersonaSelector />}
          {step === 'DRAW'           && <CardDeck mode="daily" />}
          {step === 'RESULT'         && <ResultView mode="daily" />}
          {step === 'CHAT'           && (
            <div className="max-w-2xl mx-auto glass-card rounded-2xl overflow-hidden">
              <ChatWindow />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
