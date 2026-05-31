'use client'
// ============================================================
// CardDeck.tsx — 抽卡互動（水平展開，串流解讀版）
// 抽完後呼叫 interpretCardsStream，立即跳到結果頁逐字顯示
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { fetchCards, interpretCardsStream } from '@/lib/api'
import type { DrawnCard, TarotCard } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

const CARD_W = 72
const CARD_H = 116

const CARD_BACK = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='116' viewBox='0 0 72 116'%3E%3Crect width='72' height='116' rx='7' fill='%231e1040'/%3E%3Crect x='4' y='4' width='64' height='108' rx='5' fill='none' stroke='%238b5cf6' stroke-width='1'/%3E%3Crect x='8' y='8' width='56' height='100' rx='3' fill='none' stroke='%236d28d9' stroke-width='0.5' stroke-dasharray='3 2'/%3E%3Ccircle cx='36' cy='58' r='20' fill='none' stroke='%237c3aed' stroke-width='0.8'/%3E%3Ctext x='36' y='64' text-anchor='middle' font-size='20' fill='%23a78bfa'%3E%E2%9C%A6%3C/text%3E%3Ccircle cx='12' cy='12' r='2.5' fill='%236d28d9'/%3E%3Ccircle cx='60' cy='12' r='2.5' fill='%236d28d9'/%3E%3Ccircle cx='12' cy='104' r='2.5' fill='%236d28d9'/%3E%3Ccircle cx='60' cy='104' r='2.5' fill='%236d28d9'/%3E%3C/svg%3E`

function CardFallback({ name, suit }: { name: string; suit?: string }) {
  const gradients: Record<string, string> = {
    wands: 'linear-gradient(160deg,#7c2d12,#92400e)',
    cups: 'linear-gradient(160deg,#1e3a5f,#1e40af)',
    swords: 'linear-gradient(160deg,#1f2937,#374151)',
    pentacles: 'linear-gradient(160deg,#14532d,#166534)',
    major: 'linear-gradient(160deg,#3b0764,#4c1d95)',
  }
  return (
    <div style={{ width: '100%', height: '100%', background: gradients[suit ?? 'major'] ?? gradients.major, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
      <span style={{ fontSize: 20, marginBottom: 4 }}>✦</span>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 8, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.3 }}>{name}</p>
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface DeckCard {
  card: TarotCard
  isFlipped: boolean
  isReversed: boolean
  selectedOrder: number
  imgError: boolean
}

interface CardDeckProps {
  mode: 'ai' | 'yesno' | 'love' | 'daily'
}

export function CardDeck({ mode }: CardDeckProps) {
  const {
    selectedSpread, selectedPersona, question,
    cardCache, setCardCache,
    setDrawnCards,
    clearInterpretation, appendInterpretation, setSessionId,
    setIsLoadingInterpret, setIsStreaming,
    nextStep,
  } = useTarotStore()

  const [deck, setDeck]           = useState<DeckCard[]>([])
  const [loading, setLoading]     = useState(true)
  const [interpreting, setInterpreting] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [spacing, setSpacing]     = useState(15)

  const neededCount  = selectedSpread?.card_count ?? 0
  const selectedCount = deck.filter(d => d.selectedOrder > 0).length
  const allSelected  = selectedCount >= neededCount && neededCount > 0

  // 計算牌間距
  useEffect(() => {
    const calc = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth - 32
        setSpacing(Math.max(10, (w - CARD_W) / (78 - 1)))
      }
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [loading])

  // 載入牌庫
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let cards: TarotCard[]
      if (Object.keys(cardCache).length > 0) {
        cards = Object.values(cardCache)
      } else {
        cards = await fetchCards()
        setCardCache(cards)
      }
      setDeck(shuffle(cards).map(card => ({
        card, isFlipped: false, isReversed: false, selectedOrder: 0, imgError: false,
      })))
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line

  // 點選牌
  const handlePick = useCallback((index: number) => {
    const d = deck[index]
    if (d.isFlipped || allSelected || interpreting) return
    const order    = selectedCount + 1
    const reversed = Math.random() < 0.5
    setDeck(prev => prev.map((item, i) =>
      i === index ? { ...item, isFlipped: true, isReversed: reversed, selectedOrder: order } : item
    ))
    setHoveredIndex(null)
  }, [deck, selectedCount, allSelected, interpreting])

  // 呼叫 SSE 串流解讀
  const handleInterpret = useCallback(async () => {
    if (!selectedSpread || !selectedPersona) return

    setInterpreting(true)
    setIsLoadingInterpret(true)
    clearInterpretation()

    const picked = deck
      .filter(d => d.selectedOrder > 0)
      .sort((a, b) => a.selectedOrder - b.selectedOrder)

    const drawnCards: DrawnCard[] = picked.map((d, i) => ({
      card_id:    d.card.id,
      is_reversed: d.isReversed,
      position:   selectedSpread.positions[i],
    }))
    setDrawnCards(drawnCards)

    // 啟動串流，收到 session_id 就立刻跳到結果頁
    await interpretCardsStream(
      {
        question:   question || '今日運勢',
        personaId:  selectedPersona.id,
        cards:      drawnCards,
        mode,
        spreadId:   selectedSpread.id,
      },
      {
        onSession: (sessionId) => {
          setSessionId(sessionId)
          setIsStreaming(true)
          setIsLoadingInterpret(false)
          nextStep()            // ← 立即跳到結果頁，文字在背景繼續串流
        },
        onText: (text) => {
          appendInterpretation(text)
        },
        onDone: () => {
          setIsStreaming(false)
          setInterpreting(false)
        },
        onError: (err) => {
          console.error('串流解讀失敗', err)
          setIsStreaming(false)
          setIsLoadingInterpret(false)
          setInterpreting(false)
        },
      }
    )
  }, [deck, selectedSpread, selectedPersona, question, mode,
      setDrawnCards, clearInterpretation, appendInterpretation,
      setSessionId, setIsLoadingInterpret, setIsStreaming, nextStep])

  if (loading || !selectedSpread) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-5xl">🔮</motion.div>
        <p className="text-white/40 text-sm">正在洗牌中...</p>
      </div>
    )
  }

  const remaining   = neededCount - selectedCount
  const containerH  = CARD_H + 80

  return (
    <div className="w-full max-w-6xl mx-auto px-2">
      {/* 標題與進度 */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
        <h2 className="text-xl font-bold text-gradient-gold mb-1">開始抽牌</h2>
        <p className="text-white/50 text-sm mb-3">
          {mode === 'daily' ? '靜下心來，感受今日的能量，點選一張牌' : '冥想你的問題，從牌海中選出你感應的牌'}
        </p>
        {!allSelected ? (
          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300">
            ✦ 還需選擇 <strong className="text-white mx-1">{remaining}</strong> 張牌 ✦
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-1.5 text-sm text-emerald-300">
            ✓ 已選完 {neededCount} 張牌
          </motion.div>
        )}
      </motion.div>

      {/* 已選牌預覽 */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-5">
            <p className="text-white/30 text-xs text-center mb-2">已選擇的牌</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {deck.filter(d => d.selectedOrder > 0)
                .sort((a, b) => a.selectedOrder - b.selectedOrder)
                .map(d => (
                  <motion.div key={d.card.id}
                    initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ type: 'spring', stiffness: 180 }}
                    className="flex flex-col items-center gap-1">
                    <div style={{ width: 88, height: 140, borderRadius: 10, overflow: 'hidden',
                      transform: d.isReversed ? 'rotate(180deg)' : undefined,
                      boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
                      border: '1.5px solid rgba(167,139,250,0.5)', flexShrink: 0 }}>
                      {!d.imgError ? (
                        <img src={d.card.image} alt={d.card.name_zh}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={() => setDeck(prev => prev.map(item =>
                            item.card.id === d.card.id ? { ...item, imgError: true } : item
                          ))} />
                      ) : <CardFallback name={d.card.name_zh} suit={d.card.suit} />}
                    </div>
                    <p className="text-violet-300 text-[10px] font-medium">
                      {selectedSpread.positions[d.selectedOrder - 1]?.label_zh}
                    </p>
                    <p className="text-white/60 text-[9px]">{d.card.name_zh}</p>
                    {d.isReversed && <p className="text-rose-400 text-[9px]">逆位</p>}
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 牌組水平展開 */}
      {!allSelected && (
        <>
          <div ref={containerRef} style={{ position: 'relative', height: containerH, width: '100%' }}>
            {deck.map((d, i) => {
              const leftPos  = i * spacing
              const isHovered = hoveredIndex === i
              const canPick  = !d.isFlipped && !allSelected
              return (
                <div key={d.card.id}
                  style={{ position: 'absolute', left: leftPos, bottom: 0, width: CARD_W, height: CARD_H,
                    zIndex: isHovered ? 200 : d.isFlipped ? 100 + d.selectedOrder : i,
                    cursor: canPick ? 'pointer' : 'default' }}
                  onMouseEnter={() => canPick && setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handlePick(i)}>
                  <div style={{ width: '100%', height: '100%',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                    transform: isHovered ? 'translateY(-32px) scale(1.22)' : d.isFlipped ? 'translateY(-12px) scale(1.05)' : 'translateY(0) scale(1)',
                    boxShadow: isHovered ? '0 16px 40px rgba(139,92,246,0.7)' : d.isFlipped ? '0 8px 20px rgba(139,92,246,0.4)' : 'none',
                    borderRadius: 7 }}>
                    <div style={{ width: '100%', height: '100%', position: 'relative',
                      transformStyle: 'preserve-3d', perspective: 800,
                      transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
                      transform: d.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                      {/* 牌背 */}
                      <div style={{ position: 'absolute', inset: 0,
                        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                        borderRadius: 7, overflow: 'hidden',
                        border: isHovered ? '1.5px solid rgba(167,139,250,0.9)' : '1px solid rgba(139,92,246,0.3)' }}>
                        <img src={CARD_BACK} alt="牌背" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                      {/* 牌面 */}
                      <div style={{ position: 'absolute', inset: 0,
                        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                        transform: d.isReversed ? 'rotateY(180deg) rotate(180deg)' : 'rotateY(180deg)',
                        borderRadius: 7, overflow: 'hidden',
                        border: '1.5px solid rgba(167,139,250,0.6)' }}>
                        {!d.imgError ? (
                          <>
                            <img src={d.card.image} alt={d.card.name_zh}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              onError={() => setDeck(prev => prev.map(item =>
                                item.card.id === d.card.id ? { ...item, imgError: true } : item
                              ))} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                              padding: '12px 3px 3px' }}>
                              <p style={{ color: 'white', fontSize: 7, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }}>{d.card.name_zh}</p>
                              {d.isReversed && <p style={{ color: '#f87171', fontSize: 6, textAlign: 'center' }}>逆</p>}
                            </div>
                          </>
                        ) : <CardFallback name={d.card.name_zh} suit={d.card.suit} />}
                      </div>
                    </div>
                  </div>
                  {d.selectedOrder > 0 && (
                    <div style={{ position: 'absolute', top: -10, right: -6, zIndex: 300,
                      width: 20, height: 20, borderRadius: '50%', background: 'rgb(124,58,237)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 'bold', color: 'white',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.6)',
                      border: '1.5px solid rgba(167,139,250,0.8)' }}>
                      {d.selectedOrder}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-center text-white/20 text-xs mt-1">← 左右滑動查看全部 78 張牌 →</p>
        </>
      )}

      {/* 查看解讀按鈕 */}
      <AnimatePresence>
        {allSelected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-8">
            <button onClick={handleInterpret} disabled={interpreting}
              className="px-10 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600
                         text-white font-bold text-base glow-purple hover:from-violet-500 hover:to-purple-500
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
              {interpreting ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>🔮</motion.span>
                  {zhTW.draw.interpreting}
                </>
              ) : <>✨ {zhTW.draw.viewResult}</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
