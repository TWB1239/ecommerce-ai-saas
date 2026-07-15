'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
            AI
          </div>
          <span className="text-lg font-bold text-white">
            AI电商运营助手
          </span>
        </Link>

        {/* 导航链接 */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/features"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            功能介绍
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            定价
          </Link>
        </nav>

        {/* 右侧按钮 */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800" />
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
              >
                控制台
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  退出
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
