'use client'
// ============================================================
// components/tarot/ChatWindow.tsx — 聊天視窗元件
// session-based 對話，保留歷史，AI 記住占卜上下文
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import { sendChatMessage } from '@/lib/api'
import type { ChatMessage } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

export function ChatWindow() {
  const {
    chatHistory,
    addChatMessage,
    isChatLoading,
    setIsChatLoading,
    sessionId,
    selectedPersona,
  } = useTarotStore()

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // 新訊息時自動滾到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || isChatLoading || !selectedPersona) return

    // 加入使用者訊息
    const userMsg: ChatMessage = {
      role: 'user',
      content: msg,
      timestamp: Date.now(),
    }
    addChatMessage(userMsg)
    setInput('')
    setIsChatLoading(true)

    try {
      const res = await sendChatMessage({
        sessionId,
        message: msg,
        personaId: selectedPersona.id,
      })
      const aiMsg: ChatMessage = {
        role: 'ai',
        content: res.answer,
        timestamp: Date.now(),
      }
      addChatMessage(aiMsg)
    } catch (err) {
      const errMsg: ChatMessage = {
        role: 'ai',
        content: '抱歉，占卜師暫時無法回應，請稍後再試。',
        timestamp: Date.now(),
      }
      addChatMessage(errMsg)
    } finally {
      setIsChatLoading(false)
    }
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
        <h3 className="text-white font-semibold text-sm">
          {zhTW.chat.title}
        </h3>
        {selectedPersona && (
          <span className="ml-auto text-white/40 text-xs">
            與 {selectedPersona.name} 對話中
          </span>
        )}
      </div>

      {/* 對話記錄 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {chatHistory.length === 0 && (
          <p className="text-white/30 text-xs text-center py-4">
            有任何疑問都可以繼續問我 ✨
          </p>
        )}

        <AnimatePresence initial={false}>
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-violet-600/70 text-white rounded-br-sm'
                    : 'glass-card text-white/85 rounded-bl-sm'
                  }`}
              >
                {msg.role === 'ai' && (
                  <p className="text-violet-300 text-xs mb-1 font-medium">
                    {selectedPersona?.name ?? '占卜師'}
                  </p>
                )}
                {/* 保留換行 */}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 載入中泡泡 */}
        {isChatLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-card rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-400"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                  />
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={zhTW.chat.placeholder}
            disabled={isChatLoading}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5
                       text-sm text-white placeholder-white/30
                       focus:outline-none focus:border-violet-400
                       disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isChatLoading}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
                       text-white font-medium text-sm transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {zhTW.chat.send}
          </button>
        </div>
      </div>
    </div>
  )
}
