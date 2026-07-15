'use client'

import { useEffect, useState } from 'react'
import { createServiceClient } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Users, CreditCard, Activity, Store } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createServiceClient()
        const [usersRes, subsRes, storesRes, analysesRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('plan_tier'),
          supabase.from('stores').select('*', { count: 'exact', head: true }),
          supabase.from('analyses').select('*', { count: 'exact', head: true }),
        ])
        setStats({
          totalUsers: usersRes.count || 0,
          totalSubscriptions: subsRes.data?.length || 0,
          paidUsers: subsRes.data?.filter((s: any) => s.plan_tier !== 'free').length || 0,
          totalStores: storesRes.count || 0,
          totalAnalyses: analysesRes.count || 0,
        })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Loading text="加载管理数据..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-500 text-sm mt-1">平台运营数据概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: '注册用户', value: stats.totalUsers, color: 'bg-blue-500' },
          { icon: CreditCard, label: '付费用户', value: stats.paidUsers, color: 'bg-green-500' },
          { icon: Store, label: '店铺总数', value: stats.totalStores, color: 'bg-amber-500' },
          { icon: Activity, label: '分析次数', value: stats.totalAnalyses, color: 'bg-purple-500' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-500">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>付费用户占比</CardTitle>
          <CardDescription>当前用户结构</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${stats.totalUsers > 0 ? (stats.paidUsers / stats.totalUsers * 100) : 0}%` }} />
            </div>
            <span className="text-sm text-gray-500">
              付费率 {stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers * 100).toFixed(1)) : 0}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
            💡 提示：后续可以在此页面增加用户列表、数据导出、价格调整等功能
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
