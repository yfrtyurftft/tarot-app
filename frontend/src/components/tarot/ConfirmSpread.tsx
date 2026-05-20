'use client'
// ============================================================
// components/tarot/ConfirmSpread.tsx — AI 推薦牌陣確認元件
// AI 塔羅模式專用：顯示推薦牌陣，可接受或重新推薦
// 此元件在 SELECT_PERSONA 完成後、進入 DRAW 前執行
// ============================================================

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { recommendSpread, fetchSpreads } from '@/lib/api'
import type { SpreadLayout } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

export function ConfirmSpread() {
  const {
    question,
    selectedPersona,
    recommendedSpread,
    setRecommendedSpread,
    setSelectedSpread,
    nextStep,
  } = useTarotStore()

  const [loading, setLoading] = useState(false)
  const [spreadDetail, setSpreadDetail] = useState<SpreadLayout | null>(null)

  // 初次進入：自動呼叫 AI 推薦
  useEffect(() => {
    if (!recommendedSpread && selectedPersona) {
      callRecommend()
    }
  }, []) // eslint-disable-line

  // 取得推薦後，載入完整牌陣資料
  useEffect(() => {
    if (recommendedSpread) {
      fetchSpreads('all').then((spreads) => {
        const found = spreads.find((s) => s.id === recommendedSpread.spread_id)
        if (found) setSpreadDetail(found)
      })
    }
  }, [recommendedSpread])

  const callRecommend = async () => {
    if (!selectedPersona) return
    setLoading(true)
    try {
      const res = await recommendSpread(question, selectedPersona.id)
      setRecommendedSpread(res)
    } catch (err) {
      console.error('推薦牌陣失敗', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (!spreadDetail) return
    setSelectedSpread(spreadDetail)
    nextStep()
  }

  const handleRecommendAgain = () => {
    setRecommendedSpread(null)
    setSpreadDetail(null)
    callRecommend()
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-5xl mb-3">✨</div>
        <h2 className="text-2xl font-bold text-gradient-gold mb-2">
          {zhTW.confirmSpread.title}
        </h2>
      </motion.div>

      {loading || !recommendedSpread ? (
        // 載入中
        <div className="glass-card rounded-2xl p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mb-4 inline-block"
          >
            🔮
          </motion.div>
          <p className="text-white/60">{zhTW.question.loading}</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 border border-violet-400/30"
        >
          {/* 推薦牌陣資訊 */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">
              {recommendedSpread.spread_name}
            </h3>
            {spreadDetail && (
              <p className="text-white/50 text-sm">
                {spreadDetail.card_count} 張牌 · {spreadDetail.description_zh}
              </p>
            )}
          </div>

          {/* AI 解釋 */}
          <div className="bg-violet-900/30 rounded-xl p-4 mb-6">
            <p className="text-violet-200 text-sm leading-relaxed italic">
              「{recommendedSpread.explanation}」
            </p>
            <p className="text-violet-400/60 text-xs mt-2">
              — {selectedPersona?.name}
            </p>
          </div>

          {/* 位置預覽 */}
          {spreadDetail && (
            <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
              {spreadDetail.positions.map((pos) => (
                <span
                  key={pos.key}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70"
                >
                  {pos.label_zh}
                </span>
              ))}
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex gap-3">
            <button
              onClick={handleRecommendAgain}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-white/20
                         text-white/60 hover:text-white hover:border-white/40
                         text-sm transition-colors disabled:opacity-40"
            >
              🔄 {zhTW.confirmSpread.recommend}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!spreadDetail}
              className="flex-2 flex-1 py-2.5 rounded-xl
                         bg-gradient-to-r from-violet-600 to-purple-600
                         text-white font-bold text-sm glow-purple
                         hover:from-violet-500 hover:to-purple-500
                         disabled:opacity-40 transition-all"
            >
              ✨ {zhTW.confirmSpread.useThis}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
