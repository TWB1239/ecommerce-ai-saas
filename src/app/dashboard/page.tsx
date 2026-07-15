'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { getTrialDaysLeft, formatPrice, getPlatformLabel } from '@/lib/utils'
import { Search, PenLine, Mic, TrendingUp, Store, Clock, Crosshair, MessageSquare } from 'lucide-react'

const quickActions = [
  { href: '/dashboard/diagnosis', label: '店铺诊断', desc: 'AI 全面分析店铺问题', icon: Search, color: 'bg-amber-500' },
  { href: '/dashboard/title-optimize', label: '标题优化', desc: '优化产品标题提升搜索排名', icon: PenLine, color: 'bg-blue-500' },
  { href: '/dashboard/competitor-analysis', label: '竞品对比', desc: '对比竞品找出差距和机会', icon: Crosshair, color: 'bg-red-500' },
  { href: '/dashboard/review-analysis', label: '评价分析', desc: '分析评价改进产品和服务', icon: MessageSquare, color: 'bg-emerald-500' },
  { href: '/dashboard/live-script', label: '直播话术', desc: 'AI 生成专业直播脚本', icon: Mic, color: 'bg-purple-500' },
  { href: '/dashboard/revenue', label: '营业额分析', desc: '分析数据找出增长点', icon: TrendingUp, color: 'bg-green-500' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [stores, setStores] = useState<any[]>([])
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <Loading text="加载中..." />

  const trialDays = subscription ? getTrialDaysLeft(subscription.trial_end) : 0
  const isTrialing = subscription?.status === 'trialing' || subscription?.plan_tier === 'free'

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">欢迎回来，{user?.email?.split('@')[0] || '店主'} 👋</h1>
            <p className="text-amber-100 mt-1">今天也要用 AI 让生意更好做</p>
          </div>
          <div className="text-right">
            {isTrialing ? (
              <Badge variant="warning" className="text-sm px-3 py-1">
                免费试用剩余 {trialDays} 天
              </Badge>
            ) : (
              <Badge variant="success" className="text-sm px-3 py-1">
                专业版会员
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="card-hover cursor-pointer h-full">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">{action.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 左侧：我的店铺 / 右侧：使用统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                我的店铺
              </CardTitle>
              <CardDescription>最近添加的店铺</CardDescription>
            </div>
            <Link href="/dashboard/stores" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              管理 →
            </Link>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">还没有添加店铺</p>
                <Link href="/dashboard/stores" className="text-amber-600 text-sm hover:underline mt-1 inline-block">
                  添加你的第一个店铺 →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{store.name}</p>
                      <p className="text-xs text-gray-500">{getPlatformLabel(store.platform)} · {store.category}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{formatPrice(store.monthly_revenue || 0)}/月</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              今日使用统计
            </CardTitle>
            <CardDescription>免费用户每天有使用次数限制</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '店铺诊断', count: usage?.diagnosis_count || 0, limit: 3, color: 'text-amber-600' },
                { label: '标题优化', count: usage?.title_optimize_count || 0, limit: 5, color: 'text-blue-600' },
                { label: '竞品对比', count: usage?.competitor_analysis_count || 0, limit: 3, color: 'text-red-600' },
                { label: '评价分析', count: usage?.review_analysis_count || 0, limit: 3, color: 'text-emerald-600' },
                { label: '直播话术', count: usage?.live_script_count || 0, limit: 2, color: 'text-purple-600' },
                { label: '营业额分析', count: usage?.revenue_analysis_count || 0, limit: 2, color: 'text-green-600' },
              ].map((item) => (
                <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                    <span className="text-xs text-gray-400">/ {item.limit}</span>
                  </div>
                </div>
              ))}
            </div>
            {isTrialing && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-center">
                <p className="text-sm text-amber-800">
                  试用期不限次数！之后免费用户每天有上限
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
