'use client'
// ============================================================
// ResultView.tsx — 占卜結果（SSE 串流逐字顯示版）
// isStreaming=true 時顯示打字游標，文字邊收邊顯示
// ============================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { CardSpread } from './CardSpread'
import { ChatWindow } from './ChatWindow'
import type { TarotMode } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

interface ResultViewProps {
  mode: TarotMode
}

export function ResultView({ mode }: ResultViewProps) {
  const {
    drawnCards, selectedSpread, selectedPersona,
    interpretation, isLoadingInterpret, isStreaming,
    cardCache, reset,
  } = useTarotStore()

  const [showChat, setShowChat] = useState(false)
  const cardCount = drawnCards.length

  const thumbW = cardCount === 1 ? 90 : cardCount <= 3 ? 80 : cardCount <= 7 ? 68 : 60
  const thumbH = Math.round(thumbW * 1.6)

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 space-y-5">

      {/* 標題 */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-2">
        <h2 className="text-2xl font-bold text-gradient-gold mb-1">{zhTW.result.title}</h2>
        {selectedPersona && (
          <p className="text-white/40 text-sm">由 {selectedPersona.name} 為你解讀</p>
        )}
      </motion.div>

      {/* 牌陣展示 */}
      {selectedSpread && drawnCards.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 pt-4 pb-2 flex items-center gap-2">
            <span className="text-violet-400 text-sm">🃏</span>
            <span className="text-white/50 text-sm">{selectedSpread.name_zh}</span>
          </div>
          <div className="flex items-center justify-center"
            style={{ padding: cardCount === 1 ? '24px 16px 40px' : '16px 16px 36px' }}>
            <CardSpread spread={selectedSpread} drawnCards={drawnCards} cardCache={cardCache} />
          </div>
        </motion.div>
      )}

      {/* 多牌橫向列表 */}
      {cardCount > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <p className="text-white/40 text-xs mb-2 px-1">抽到的牌</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {drawnCards.map((drawn, i) => {
              const card = cardCache[drawn.card_id]
              if (!card) return null
              return (
                <div key={i} className="glass-card rounded-xl p-2.5 flex gap-3 items-center flex-shrink-0" style={{ minWidth: 180 }}>
                  <div className="rounded-lg overflow-hidden flex-shrink-0"
                    style={{ width: thumbW, height: thumbH,
                      transform: drawn.is_reversed ? 'rotate(180deg)' : undefined,
                      border: '1px solid rgba(139,92,246,0.4)' }}>
                    <img src={card.image} alt={card.name_zh} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/40 text-[10px]">{drawn.position.label_zh}</p>
                    <p className="text-white font-bold text-sm truncate">{card.name_zh}</p>
                    <p className="text-white/50 text-[10px] truncate">{card.name_en}</p>
                    <span className={`text-xs mt-1 inline-block ${drawn.is_reversed ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {drawn.is_reversed ? zhTW.result.reversed : zhTW.result.upright}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* 單卡牌名資訊 */}
      {cardCount === 1 && drawnCards[0] && (() => {
        const drawn = drawnCards[0]
        const card  = cardCache[drawn.card_id]
        return card ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center">
            <div className="glass-card rounded-2xl px-8 py-4 text-center">
              <p className="text-white/40 text-xs mb-1">{drawn.position.label_zh}</p>
              <p className="text-white font-bold text-xl">{card.name_zh}</p>
              <p className="text-white/50 text-sm">{card.name_en}</p>
              <span className={`text-sm mt-1 inline-block ${drawn.is_reversed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {drawn.is_reversed ? '逆位' : '正位'}
              </span>
            </div>
          </motion.div>
        ) : null
      })()}

      {/* ── AI 解讀（串流逐字顯示）── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 border border-violet-400/20">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✨</span>
          <h3 className="text-white font-bold text-lg">{zhTW.result.interpretation}</h3>
          {selectedPersona && (
            <span className="ml-auto text-white/30 text-xs">{selectedPersona.name}</span>
          )}
          {/* 串流進行中的指示燈 */}
          {isStreaming && (
            <div className="flex items-center gap-1.5">
              <motion.div className="w-2 h-2 rounded-full bg-violet-400"
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <span className="text-violet-400/70 text-xs">解讀中</span>
            </div>
          )}
        </div>

        {/* 載入中（還沒收到第一個字）*/}
        {isLoadingInterpret && !interpretation && (
          <div className="flex items-center gap-3 text-white/50 py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="text-3xl">🔮</motion.div>
            <span>AI 正在感應牌陣能量...</span>
          </div>
        )}

        {/* 串流文字 + 打字游標 */}
        {interpretation && (
          <div className="text-white/85 leading-8 text-base whitespace-pre-wrap"
            style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
            {interpretation}
            {/* 串流進行中顯示打字游標 */}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'steps(1)' }}
                className="inline-block w-0.5 h-5 bg-violet-400 ml-0.5 align-middle"
              />
            )}
          </div>
        )}
      </motion.div>

      {/* 聊天視窗 */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="glass-card rounded-2xl overflow-hidden">
            <ChatWindow />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 按鈕列（串流完成後才顯示）*/}
      <AnimatePresence>
        {!isStreaming && !isLoadingInterpret && interpretation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex gap-3">
            <button onClick={() => setShowChat(v => !v)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600/80 to-purple-600/80
                         text-white font-medium hover:from-violet-500 hover:to-purple-500
                         transition-all flex items-center justify-center gap-2">
              💬 {showChat ? '收起聊天' : zhTW.result.openChat}
            </button>
            <button onClick={reset}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white/60
                         hover:border-white/40 hover:text-white transition-colors">
              🔄 {zhTW.result.reset}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
