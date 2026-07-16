'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Store, FileText, MessageSquareText,
  BarChart3, History, LogOut, ChevronLeft, ChevronRight,
  Menu, X, Search, Sparkles, Crosshair, Bot,
} from 'lucide-react'

import Particles from '@/components/particles'

const navItems = [
  { href: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { href: '/dashboard/stores', label: '我的店铺', icon: Store },
  { href: '/dashboard/diagnosis', label: '店铺诊断', icon: Search },
  { href: '/dashboard/competitor-analysis', label: '竞品对比', icon: Crosshair },
  { href: '/dashboard/review-analysis', label: '评价分析', icon: MessageSquareText },
  { href: '/dashboard/title-optimize', label: '标题优化', icon: FileText },
  { href: '/dashboard/live-script', label: '直播话术', icon: MessageSquareText },
  { href: '/dashboard/revenue', label: '营业额分析', icon: BarChart3 },
  { href: '/dashboard/history', label: '历史记录', icon: History },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">加载中...</p>
      </div>
    </div>
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-600/20 ring-1 ring-white/10">
          <Bot className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-base text-white tracking-tight">灵境</span>
            <p className="text-[10px] text-zinc-500 -mt-0.5">AI 电商运营平台</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm
                ${isActive
                  ? 'bg-violet-500/10 text-violet-300 font-medium ring-1 ring-violet-500/20'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}>
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-1.5 text-xs text-zinc-600 truncate flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
            {user.email}
          </div>
        )}
        <button onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-sm ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>退出</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 flex">
      <Particles />

      {/* Desktop Sidebar - fixed */}
      <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-zinc-900/70 border-r border-white/[0.06] backdrop-blur-2xl transition-all duration-300 z-30
        ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors shadow-xl z-40">
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 z-50 transform transition-transform duration-300 md:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-end p-2">
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main - offset for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-56'}`}>
        <header className="md:hidden bg-zinc-900/90 border-b border-white/5 px-4 py-3 flex items-center gap-3 backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">灵境</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.03),transparent_60%)]">
          {children}
        </main>
      </div>
    </div>
  )
}
