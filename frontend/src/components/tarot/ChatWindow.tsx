'use client'
// ============================================================
// ChatWindow.tsx — 聊天視窗（SSE 串流逐字回覆版）
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { sendChatMessageStream } from '@/lib/api'
import type { ChatMessage } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

export function ChatWindow() {
  const {
    chatHistory, addChatMessage,
    isChatLoading, setIsChatLoading,
    sessionId, selectedPersona,
  } = useTarotStore()

  const [input, setInput]             = useState('')
  const [streamingText, setStreamingText] = useState('')  // 串流中的暫存文字
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, streamingText])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || isChatLoading || !selectedPersona) return

    // 加入使用者訊息
    addChatMessage({ role: 'user', content: msg, timestamp: Date.now() })
    setInput('')
    setIsChatLoading(true)
    setStreamingText('')

    await sendChatMessageStream(
      { sessionId, message: msg, personaId: selectedPersona.id },
      {
        onText: (text) => {
          setStreamingText(prev => prev + text)
        },
        onDone: () => {
          // 串流結束：把累積的文字存入 chatHistory，清空暫存
          setStreamingText(prev => {
            if (prev) {
              addChatMessage({ role: 'ai', content: prev, timestamp: Date.now() })
            }
            return ''
          })
          setIsChatLoading(false)
        },
        onError: () => {
          setStreamingText('')
          addChatMessage({
            role: 'ai',
            content: '抱歉，占卜師暫時無法回應，請稍後再試。',
            timestamp: Date.now(),
          })
          setIsChatLoading(false)
        },
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      {/* 標題列 */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <span className="text-lg">💬</span>
        <h3 className="text-white font-semibold text-sm">{zhTW.chat.title}</h3>
        {selectedPersona && (
          <span className="ml-auto text-white/40 text-xs">與 {selectedPersona.name} 對話中</span>
        )}
      </div>

      {/* 對話記錄 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {chatHistory.length === 0 && !streamingText && (
          <p className="text-white/30 text-xs text-center py-4">有任何疑問都可以繼續問我 ✨</p>
        )}

        <AnimatePresence initial={false}>
          {chatHistory.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-violet-600/70 text-white rounded-br-sm'
                  : 'glass-card text-white/85 rounded-bl-sm'}`}>
                {msg.role === 'ai' && (
                  <p className="text-violet-300 text-xs mb-1 font-medium">{selectedPersona?.name ?? '占卜師'}</p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 串流中的 AI 回覆（逐字顯示）*/}
        {streamingText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-card max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed text-white/85">
              <p className="text-violet-300 text-xs mb-1 font-medium">{selectedPersona?.name ?? '占卜師'}</p>
              <p className="whitespace-pre-wrap">
                {streamingText}
                {/* 打字游標 */}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: 'steps(1)' }}
                  className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle"
                />
              </p>
            </div>
          </motion.div>
        )}

        {/* 等待第一個字時的三點動畫 */}
        {isChatLoading && !streamingText && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-400"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 輸入區 */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown} placeholder={zhTW.chat.placeholder} disabled={isChatLoading}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
                       text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-400
                       disabled:opacity-50 transition-colors" />
          <button onClick={handleSend} disabled={!input.trim() || isChatLoading}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm
                       transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {zhTW.chat.send}
          </button>
        </div>
      </div>
    </div>
  )
}
