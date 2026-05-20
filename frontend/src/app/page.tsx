'use client'
// ============================================================
// app/page.tsx — AI 塔羅占卜（首頁，預設模式）
// 流程：INPUT_QUESTION → SELECT_PERSONA → CONFIRM_SPREAD
//       → DRAW → RESULT → CHAT
// ============================================================

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { PersonaSelector } from '@/components/tarot/PersonaSelector'
import { CardDeck } from '@/components/tarot/CardDeck'
import { CardSpread } from '@/components/tarot/CardSpread'
import { ChatWindow } from '@/components/tarot/ChatWindow'
import { QuestionInput } from '@/components/tarot/QuestionInput'
import { ConfirmSpread } from '@/components/tarot/ConfirmSpread'
import { ResultView } from '@/components/tarot/ResultView'
import { StepIndicator } from '@/components/tarot/StepIndicator'
import { zhTW } from '@/i18n/zh-TW'

export default function AiTarotPage() {
  const { mode, setMode, step } = useTarotStore()

  // 確保 mode 為 'ai'
  useEffect(() => {
    if (mode !== 'ai') setMode('ai')
  }, [mode, setMode])

  return (
    <div className="min-h-screen py-8 px-4">
      {/* 步驟指示器 */}
      <StepIndicator mode="ai" />

      {/* 各步驟內容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {step === 'INPUT_QUESTION' && <QuestionInput mode="ai" />}
          {step === 'SELECT_PERSONA' && <PersonaSelector />}
          {step === 'CONFIRM_SPREAD' && <ConfirmSpread />}
          {step === 'DRAW'           && <CardDeck mode="ai" />}
          {step === 'RESULT'         && <ResultView mode="ai" />}
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
