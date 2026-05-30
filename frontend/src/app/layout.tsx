// ============================================================
// app/layout.tsx — 根 Layout（加入 Preloader）
// ============================================================

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/tarot/Navbar'
import { Preloader } from '@/components/tarot/Preloader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '塔羅 AI 占卜',
  description: '結合 AI 的現代塔羅占卜體驗',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} min-h-screen bg-[#0a0a1a] text-white`}>
        {/* 全域星空背景 */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0f0f2e] to-[#0a0a1a]" />
          <div className="stars-layer" />
        </div>

        {/* 背景預載（喚醒後端 + 預載圖片）— 使用者不可見 */}
        <Preloader />

        {/* 導航列 */}
        <Navbar />

        {/* 主內容 */}
        <main className="relative z-10 pt-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
