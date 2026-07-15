'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '控制台', icon: '📊' },
  { href: '/dashboard/stores', label: '我的店铺', icon: '🏪' },
  { href: '/dashboard/diagnosis', label: '店铺诊断', icon: '🔍' },
  { href: '/dashboard/title-optimize', label: '标题优化', icon: '✏️' },
  { href: '/dashboard/competitor-analysis', label: '竞品对比', icon: '📊' },
  { href: '/dashboard/review-analysis', label: '评价分析', icon: '💬' },
  { href: '/dashboard/live-script', label: '直播话术', icon: '🎙️' },
  { href: '/dashboard/revenue', label: '营业额分析', icon: '📈' },
  { href: '/dashboard/history', label: '历史记录', icon: '📋' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* 移动端遮罩 */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] flex-col border-r border-white/10 bg-zinc-900/95 backdrop-blur-xl transition-all duration-300 lg:static lg:z-auto',
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'
        )}
      >
        {/* 折叠按钮 */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-end p-4 text-zinc-400 hover:text-white lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 导航列表 */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* 底部用户信息 */}
        {!collapsed && (
          <div className="border-t border-white/10 p-4">
            <p className="text-xs text-zinc-500">AI电商运营助手 v1.0</p>
          </div>
        )}
      </aside>
    </>
  )
}
