'use client'
// ============================================================
// components/tarot/QuestionInput.tsx — 問題輸入元件
// AI 塔羅：輸入問題後呼叫 /api/recommend-spread
// 是否/感情：輸入問題後直接進入抽卡
// ============================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { recommendSpread } from '@/lib/api'
import type { TarotMode } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

interface QuestionInputProps {
  mode: TarotMode
}

// 各模式的問題輸入提示
const MODE_CONFIG: Record<TarotMode, { title: string; subtitle: string; placeholder: string }> = {
  ai: {
    title:       zhTW.question.title,
    subtitle:    zhTW.question.subtitle,
    placeholder: zhTW.question.placeholder,
  },
  yesno: {
    title:       zhTW.question.yesnoTitle,
    subtitle:    zhTW.question.yesnoSubtitle,
    placeholder: zhTW.question.yesnoHint,
  },
  love: {
    title:       zhTW.question.loveTitle,
    subtitle:    zhTW.question.loveSubtitle,
    placeholder: zhTW.question.loveHint,
  },
  daily: {
    title:       '今日運勢',
    subtitle:    '無需輸入問題',
    placeholder: '',
  },
}

export function QuestionInput({ mode }: QuestionInputProps) {
  const {
    question,
    setQuestion,
    selectedPersona,
    setRecommendedSpread,
    setIsLoadingRecommend,
    isLoadingRecommend,
    nextStep,
  } = useTarotStore()

  const [localQ, setLocalQ] = useState(question)
  const [error, setError] = useState('')
  const cfg = MODE_CONFIG[mode]

  const handleSubmit = async () => {
    const q = localQ.trim()
    if (!q) {
      setError('請輸入你的問題')
      return
    }
    setError('')
    setQuestion(q)

    if (mode === 'ai') {
      // AI 塔羅模式：先送到後端取得推薦牌陣，需要先選人設
      // 流程：INPUT_QUESTION → SELECT_PERSONA → CONFIRM_SPREAD
      // 這裡先進到 SELECT_PERSONA，選完人設後再推薦
      nextStep()
    } else {
      // 是否/感情模式：問題設定完直接進入下一步（DRAW）
      nextStep()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* 標題 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        {/* 占卜符號 */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🔮
        </motion.div>
        <h1 className="text-3xl font-bold text-gradient-gold mb-2">{cfg.title}</h1>
        <p className="text-white/50">{cfg.subtitle}</p>
      </motion.div>

      {/* 問題輸入框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-6"
      >
        <label className="block text-white/60 text-sm mb-2">你想占卜的問題</label>
        <textarea
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder={cfg.placeholder}
          rows={3}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3
                     text-white placeholder-white/25 text-base resize-none
                     focus:outline-none focus:border-violet-400 transition-colors"
        />

        {/* 錯誤提示 */}
        {error && (
          <p className="text-rose-400 text-sm mt-2">{error}</p>
        )}

        {/* 送出按鈕 */}
        <motion.button
          onClick={handleSubmit}
          disabled={isLoadingRecommend}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full py-3 rounded-xl
                     bg-gradient-to-r from-violet-600 to-purple-600
                     text-white font-bold text-base
                     hover:from-violet-500 hover:to-purple-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     glow-purple transition-all"
        >
          {isLoadingRecommend
            ? zhTW.question.loading
            : mode === 'ai'
              ? zhTW.question.submit
              : zhTW.common.next}
        </motion.button>
      </motion.div>

      {/* 提示文字 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-white/25 text-xs mt-4"
      >
        塔羅占卜僅供參考，最終決定權在於你自己
      </motion.p>
    </div>
  )
}
