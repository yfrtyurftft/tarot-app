'use client'
// ============================================================
// app/love/page.tsx — 感情塔羅占卜
// 流程：SELECT_SPREAD → SELECT_PERSONA → INPUT_QUESTION
//       → DRAW → RESULT → CHAT
// ============================================================

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { SpreadSelector } from '@/components/tarot/SpreadSelector'
import { PersonaSelector } from '@/components/tarot/PersonaSelector'
import { QuestionInput } from '@/components/tarot/QuestionInput'
import { CardDeck } from '@/components/tarot/CardDeck'
import { ResultView } from '@/components/tarot/ResultView'
import { ChatWindow } from '@/components/tarot/ChatWindow'
import { StepIndicator } from '@/components/tarot/StepIndicator'

export default function LovePage() {
  const { mode, setMode, step } = useTarotStore()

  useEffect(() => {
    if (mode !== 'love') setMode('love')
  }, [mode, setMode])

  return (
    <div className="min-h-screen py-8 px-4">
      <StepIndicator mode="love" />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
        >
          {step === 'SELECT_SPREAD'  && <SpreadSelector mode="love" />}
          {step === 'SELECT_PERSONA' && <PersonaSelector />}
          {step === 'INPUT_QUESTION' && <QuestionInput mode="love" />}
          {step === 'DRAW'           && <CardDeck mode="love" />}
          {step === 'RESULT'         && <ResultView mode="love" />}
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
