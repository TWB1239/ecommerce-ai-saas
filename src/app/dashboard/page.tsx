'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type {} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTrialDaysLeft, formatPrice, getPlatformLabel } from '@/lib/utils'
import {
  Search, PenLine, Mic, TrendingUp, Store, Clock,
  Crosshair, MessageSquare, Sparkles, ChevronRight, ChevronDown, Bot
} from 'lucide-react'
import {} from 'recharts'

// 动态欢迎语
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

const DAILY_TIPS = [
  { icon: '📈', text: '今日营业额目标：查看分析报告' },
  { icon: '🏷️', text: '热销品类推荐：日用百货 / 换季服饰' },
  { icon: '⚡', text: '竞品动态：建议做一次竞品对比分析' },
  { icon: '💡', text: '标题优化建议：核心关键词前置' },
]

const quickActions = [
  { href: '/dashboard/diagnosis', label: '店铺诊断', desc: 'AI 分析店铺问题', icon: Search, gradient: 'from-amber-500 to-orange-600' },
  { href: '/dashboard/competitor-analysis', label: '竞品对比', desc: '对比竞品找出差距', icon: Crosshair, gradient: 'from-rose-500 to-pink-600' },
  { href: '/dashboard/review-analysis', label: '评价分析', desc: '分析评价改进产品', icon: MessageSquare, gradient: 'from-emerald-500 to-teal-600' },
  { href: '/dashboard/title-optimize', label: '标题优化', desc: '优化标题提升排名', icon: PenLine, gradient: 'from-sky-500 to-cyan-600' },
  { href: '/dashboard/live-script', label: '直播话术', desc: 'AI 生成直播脚本', icon: Mic, gradient: 'from-violet-500 to-purple-600' },
  { href: '/dashboard/revenue', label: '营业额分析', desc: '分析数据增涨点', icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stores, setStores] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tipIndex, setTipIndex] = useState(0)
  const [showGuide, setShowGuide] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setTipIndex(i => (i + 1) % DAILY_TIPS.length), 7000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const [subRes, storeRes, usageRes] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('stores').select('*').eq('user_id', user.id).limit(5),
        supabase.from('usage_counts').select('*').eq('user_id', user.id).eq('date', new Date().toISOString().split('T')[0]).single(),
      ])
      if (subRes.data) setSubscription(subRes.data)
      if (storeRes.data) setStores(storeRes.data)
      if (usageRes.data) setUsage(usageRes.data)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-600 text-sm">加载中...</p>
      </div>
    </div>
  )

  const trialDays = subscription ? getTrialDaysLeft(subscription.trial_end) : 0
  const planTier = subscription?.plan_tier || 'free'
  const planLabel = subscription?.status === 'trialing' ? `试用 · 剩${trialDays}天` : 
    planTier === 'pro' ? '专业版' : planTier === 'business' ? '企业版' : '免费版'
  const planColor = planTier === 'pro' ? 'from-violet-500 to-purple-600' : 
    planTier === 'business' ? 'from-amber-500 to-orange-600' : 'from-zinc-500 to-zinc-600'

  const userName = user?.email?.split('@')[0] || '店主'

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-zinc-900/80 p-5 md:p-6 border border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {getGreeting()}，{userName}
            </h1>
            <div className="h-4 overflow-hidden">
              <p className="text-zinc-400 text-xs transition-all duration-500">
                💡 {DAILY_TIPS[tipIndex].text}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Badge className={`cursor-pointer bg-gradient-to-r ${planColor} text-white text-xs px-3 py-1 border-0 shadow-lg hover:scale-105 transition-transform`}>
                {planLabel}
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      {/* 🚀 快速开始 - Collapsible Guide */}
      {stores.length === 0 && (
        <div className="rounded-xl bg-gradient-to-br from-violet-600/10 to-purple-600/10 border border-violet-500/20 backdrop-blur-md overflow-hidden">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🚀</span>
              <span className="text-sm font-semibold text-zinc-200">快速开始</span>
              <span className="text-[11px] text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-full">4 步上手</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${showGuide ? 'rotate-180' : ''}`} />
          </button>
          {showGuide && (
            <div className="px-4 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { step: '①', title: '添加店铺信息', desc: '在「我的店铺」添加你的电商店铺', icon: Store, color: 'from-sky-500 to-cyan-600' },
                { step: '②', title: '使用店铺诊断', desc: 'AI 自动诊断店铺问题和机会', icon: Search, color: 'from-amber-500 to-orange-600' },
                { step: '③', title: '分析数据', desc: '查看营业额趋势与竞品对比', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
                { step: '④', title: '优化提升', desc: '根据建议优化标题、评价和直播', icon: Sparkles, color: 'from-violet-500 to-purple-600' },
              ].map((item) => (
                <div key={item.step} className="bg-white/[0.04] rounded-lg p-3.5 border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2.5 text-white text-xs font-bold shadow-sm`}>
                    {item.step}
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-200 mb-0.5">{item.title}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions — 6 Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="group cursor-pointer h-full rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5 text-center">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl mx-auto`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-zinc-200 group-hover:text-white transition-colors text-[15px]">{action.label}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart - 无数据时显示空白 */}
        <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-200">近 7 天营业额趋势</h3>
            </div>
            <span className="text-xs text-zinc-600">暂无数据</span>
          </div>
          <div className="h-52 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-600 text-xs">添加店铺数据后自动展示趋势图</p>
              <Link href="/dashboard/revenue" className="text-violet-400 text-xs hover:underline mt-1 inline-block">
                去添加数据 →
              </Link>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-zinc-200">今日使用统计</h3>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: '店铺诊断', count: usage?.diagnosis_count || 0, limit: 3, g: 'from-amber-500 to-orange-600' },
              { label: '标题优化', count: usage?.title_optimize_count || 0, limit: 5, g: 'from-sky-500 to-cyan-600' },
              { label: '竞品对比', count: usage?.competitor_analysis_count || 0, limit: 3, g: 'from-rose-500 to-pink-600' },
              { label: '评价分析', count: usage?.review_analysis_count || 0, limit: 3, g: 'from-emerald-500 to-teal-600' },
              { label: '直播话术', count: usage?.live_script_count || 0, limit: 2, g: 'from-violet-500 to-purple-600' },
              { label: '营业额', count: usage?.revenue_analysis_count || 0, limit: 2, g: 'from-green-500 to-emerald-600' },
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                <p className="text-[11px] text-zinc-500 mb-1.5">{item.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-zinc-200">{item.count}</span>
                  <span className="text-[11px] text-zinc-600">/ {item.limit}</span>
                </div>
                <div className="mt-2 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${item.g} transition-all duration-700`}
                    style={{ width: `${Math.min((item.count / item.limit) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          {(subscription?.status === 'trialing' || planTier === 'free') && (
            <div className="mt-3 p-2.5 bg-violet-500/8 rounded-lg border border-violet-500/15 text-center">
              <p className="text-xs text-violet-300/80">🎉 试用期不限次数，尽情使用</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-zinc-200">我的店铺</h3>
            </div>
            <Link href="/dashboard/stores" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5">
              管理 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {stores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="w-7 h-7 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm text-zinc-500">还没有添加店铺</p>
              <Link href="/dashboard/stores" className="text-violet-400 text-xs hover:underline mt-1 inline-block">
                添加第一个店铺 →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {stores.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                  <div>
                    <p className="font-medium text-zinc-200 text-sm">{s.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{getPlatformLabel(s.platform)} · {s.category}</p>
                  </div>
                  <p className="text-sm font-medium text-zinc-400">{formatPrice(s.monthly_revenue || 0)}/月</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-zinc-200">本周运营摘要</h3>
          </div>
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center">
              <Bot className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-zinc-400 text-sm">还没有足够的数据</p>
            <p className="text-zinc-600 text-xs mt-1">先去「店铺诊断」或「营业额分析」使用一次</p>
            <Link href="/dashboard/diagnosis" className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium">
              开始诊断 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
