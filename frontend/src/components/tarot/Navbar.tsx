'use client'
// ============================================================
// components/tarot/Navbar.tsx — 頂部導航列
// 切換四個占卜模式，點擊時重置對應模式的狀態
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTarotStore } from '@/store/useTarotStore'
import type { TarotMode } from '@/types/tarot'
import { zhTW } from '@/i18n/zh-TW'

// 導航項目定義
const NAV_ITEMS: { href: string; mode: TarotMode; label: string; icon: string }[] = [
  { href: '/',       mode: 'ai',    label: zhTW.nav.ai,    icon: '✨' },
  { href: '/yesno',  mode: 'yesno', label: zhTW.nav.yesno, icon: '⚖️' },
  { href: '/love',   mode: 'love',  label: zhTW.nav.love,  icon: '💕' },
  { href: '/daily',  mode: 'daily', label: zhTW.nav.daily, icon: '🌟' },
]

export function Navbar() {
  const pathname = usePathname()
  const setMode = useTarotStore((s) => s.setMode)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 品牌標誌 */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-2xl">🔮</span>
          <span className="text-gradient-gold font-bold text-lg hidden sm:block">
            塔羅 AI
          </span>
        </div>

        {/* 導航連結 */}
        <div className="flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMode(item.mode)}
                className="relative px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm
                           transition-colors duration-200
                           hover:text-white text-white/70"
              >
                {/* 選中底線動畫 */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-violet-600/30 border border-violet-500/50"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  <span>{item.icon}</span>
                  <span className={isActive ? 'text-white font-medium' : ''}>
                    {item.label}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
