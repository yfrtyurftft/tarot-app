'use client'
// ============================================================
// components/tarot/StepIndicator.tsx — 步驟進度指示器
// 顯示當前在哪個步驟，不含 CHAT（聊天是附加功能）
// ============================================================

import { motion } from 'framer-motion'
import { useTarotStore, MODE_STEPS } from '@/store/useTarotStore'
import type { TarotMode, Step } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

interface StepIndicatorProps {
  mode: TarotMode
}

// 步驟圖示
const STEP_ICONS: Record<Step, string> = {
  SELECT_SPREAD:  '🃏',
  SELECT_PERSONA: '🧙',
  INPUT_QUESTION: '❓',
  CONFIRM_SPREAD: '✨',
  DRAW:           '🎴',
  RESULT:         '📖',
  CHAT:           '💬',
}

export function StepIndicator({ mode }: StepIndicatorProps) {
  const { step } = useTarotStore()

  // 顯示的步驟（排除 CHAT）
  const steps = MODE_STEPS[mode].filter((s) => s !== 'CHAT')
  const currentIndex = steps.indexOf(step)

  if (steps.length <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 mb-8 px-4">
      {steps.map((s, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex

        return (
          <div key={s} className="flex items-center">
            {/* 步驟圓點 */}
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isDone
                    ? 'rgb(139, 92, 246)'
                    : isCurrent
                      ? 'rgb(167, 139, 250)'
                      : 'rgba(255,255,255,0.1)',
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm
                           border border-white/10"
              >
                {isDone ? (
                  <span className="text-white text-xs">✓</span>
                ) : (
                  <span>{STEP_ICONS[s]}</span>
                )}
              </motion.div>
              {/* 步驟名稱（只顯示當前）*/}
              {isCurrent && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-violet-300 whitespace-nowrap"
                >
                  {zhTW.steps[s]}
                </motion.span>
              )}
            </div>

            {/* 連接線 */}
            {i < steps.length - 1 && (
              <div
                className="w-6 h-px mx-1 mb-4"
                style={{
                  background: isDone
                    ? 'rgb(139, 92, 246)'
                    : 'rgba(255,255,255,0.15)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
