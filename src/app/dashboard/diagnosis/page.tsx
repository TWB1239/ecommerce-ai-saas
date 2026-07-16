'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { Search, Save, Copy, Sparkles } from 'lucide-react'

const platformOptions = [
  { value: 'taobao', label: '淘宝' },
  { value: 'pinduoduo', label: '拼多多' },
  { value: 'jd', label: '京东' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'other', label: '其他' },
]

export default function DiagnosisPage() {
  const [stores, setStores] = useState<any[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [form, setForm] = useState<any>({
    platform: 'taobao', category: '', monthly_revenue: '', avg_order_value: '',
    monthly_visitors: '', conversion_rate: '', return_rate: '',
    profit_margin: '', main_products: '', problems: '', goals: ''
  })
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('stores').select('*').eq('user_id', user.id).then(({ data }) => setStores(data || []))
      }
    })
  }, [])

  function loadStoreData(storeId: string) {
    const store = stores.find(s => s.id === storeId)
    if (!store) return
    setSelectedStore(storeId)
    setForm({
      platform: store.platform,
      category: store.category || '',
      monthly_revenue: store.monthly_revenue?.toString() || '',
      avg_order_value: store.avg_order_value?.toString() || '',
      monthly_visitors: store.monthly_visitors?.toString() || '',
      conversion_rate: store.conversion_rate?.toString() || '',
      return_rate: store.return_rate?.toString() || '',
      profit_margin: store.profit_margin?.toString() || '',
      main_products: store.main_products || '',
      problems: '', goals: '',
    })
  }

  async function analyze() {
    setLoading(true); setError(''); setResult(''); setSaved(false)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')
      const res = await fetch('/api/ai/diagnosis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.result)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  async function saveResult() {
    if (!result) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('analyses').insert({
        user_id: user.id, analysis_type: 'diagnosis',
        result: { content: result, input: form },
        store_name: form.category || '未分类',
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-600/20">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">店铺诊断</h1>
          <p className="text-xs text-zinc-500">填写店铺数据，AI 自动分析问题并给出优化方案</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Store selector */}
          {stores.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-4">
              <Label className="text-zinc-300 text-xs font-medium">快速载入已保存的店铺</Label>
              <Select options={[
                { value: '', label: '选择已有店铺...' },
                ...stores.map((s: any) => ({ value: s.id, label: s.name })),
              ]} value={selectedStore} onChange={e => loadStoreData(e.target.value)}
                className="mt-1.5" placeholder="选择已有店铺..." />
            </div>
          )}

          {/* Basic Info */}
          <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-amber-500" />
              店铺信息
            </h3>
            <div className="space-y-3.5">
              <div>
                <Label className="text-zinc-400 text-xs font-medium">电商平台</Label>
                <Select options={platformOptions} value={form.platform}
                  onChange={e => setForm({...form, platform: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">主营品类</Label>
                <Input placeholder="例如：女装 / 日用百货 / 数码配件"
                  value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">主营产品描述</Label>
                <Textarea placeholder="例如：我们主要卖韩版女装，针对18-30岁女性，价格在80-200元之间"
                  value={form.main_products} onChange={e => setForm({...form, main_products: e.target.value})}
                  className="mt-1" rows={2} />
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-blue-500" />
              经营数据
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-400 text-xs font-medium">月营业额（元）</Label>
                <Input type="number" placeholder="例如：50000"
                  value={form.monthly_revenue} onChange={e => setForm({...form, monthly_revenue: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">客单价（元）</Label>
                <Input type="number" placeholder="例如：120"
                  value={form.avg_order_value} onChange={e => setForm({...form, avg_order_value: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">月访客数</Label>
                <Input type="number" placeholder="例如：15000"
                  value={form.monthly_visitors} onChange={e => setForm({...form, monthly_visitors: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">转化率（%）</Label>
                <Input type="number" step="0.1" placeholder="例如：2.5"
                  value={form.conversion_rate} onChange={e => setForm({...form, conversion_rate: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">退货率（%）</Label>
                <Input type="number" step="0.1" placeholder="例如：8"
                  value={form.return_rate} onChange={e => setForm({...form, return_rate: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">利润率（%）</Label>
                <Input type="number" step="0.1" placeholder="例如：20"
                  value={form.profit_margin} onChange={e => setForm({...form, profit_margin: e.target.value})}
                  className="mt-1" />
              </div>
            </div>
          </div>

          {/* Problems */}
          <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-rose-500" />
              描述问题
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs font-medium">目前遇到的问题</Label>
                <Textarea placeholder="例如：流量下滑严重，转化率一直上不去，不知道问题出在哪"
                  value={form.problems} onChange={e => setForm({...form, problems: e.target.value})}
                  className="mt-1" rows={2} />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs font-medium">期望目标</Label>
                <Textarea placeholder="例如：希望将转化率从1.5%提升到3%，月营业额增长50%"
                  value={form.goals} onChange={e => setForm({...form, goals: e.target.value})}
                  className="mt-1" rows={2} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={analyze} loading={loading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20">
                <Search className="w-4 h-4 mr-1.5" /> AI 诊断分析
              </Button>
              {stores.length === 0 && (
                <Button variant="outline" onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser()
                  if (!user) return
                  await supabase.from('stores').insert({
                    user_id: user.id, name: form.category || '我的店铺',
                    platform: form.platform, ...Object.fromEntries(
                      Object.entries(form).filter(([k]) => !['problems','goals'].includes(k))
                    ),
                  })
                }} className="border-white/10 text-zinc-400 hover:text-white">
                  <Save className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Result */}
        <div className="lg:col-span-3">
          {error && <Alert variant="error" className="bg-rose-500/10 border-rose-500/20 text-rose-300">{error}</Alert>}
          {loading && (
            <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-10">
              <Loading text="AI 正在分析你的店铺数据..." />
            </div>
          )}
          {result && (
            <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-violet-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">AI 诊断报告</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={saveResult}
                    className="text-zinc-500 hover:text-zinc-200">
                    <Save className="w-3.5 h-3.5 mr-1" /> 保存
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(result)}
                    className="text-zinc-500 hover:text-zinc-200">
                    <Copy className="w-3.5 h-3.5 mr-1" /> 复制
                  </Button>
                </div>
              </div>
              {saved && <p className="text-xs text-emerald-400 mb-2">✅ 已保存到历史记录</p>}
              <div className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-sans">
                {result}
              </div>
            </div>
          )}
          {!result && !loading && !error && (
            <div className="rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-10 text-center h-full flex items-center justify-center">
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/15 flex items-center justify-center">
                  <Search className="w-7 h-7 text-amber-400" />
                </div>
                <p className="text-zinc-400 text-sm">在左侧填写店铺数据</p>
                <p className="text-zinc-600 text-xs mt-1">点击「AI 诊断分析」生成专业诊断报告</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
