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
import { Crosshair, Copy, RefreshCw } from 'lucide-react'

const platformOptions = [
  { value: 'taobao', label: '淘宝' },
  { value: 'pinduoduo', label: '拼多多' },
  { value: 'jd', label: '京东' },
  { value: 'shopify', label: 'Shopify' },
]

export default function CompetitorAnalysisPage() {
  const [stores, setStores] = useState<any[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [form, setForm] = useState({
    my_product: '', my_price: '', my_description: '', my_selling_points: '',
    my_product_url: '', competitor1_url: '', competitor2_url: '', competitor3_url: '',
    platform: 'taobao', category: '',
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    setForm(prev => ({
      ...prev,
      platform: store.platform,
      category: store.category || '',
    }))
  }

  async function analyze() {
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/ai/competitor-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.result)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-600/20">
          <Crosshair className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">竞品对比分析</h1>
          <p className="text-xs text-zinc-500">输入你的产品和竞品链接，AI 深度对比找出差异化优势</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>产品与竞品信息</CardTitle>
            <CardDescription>填写你的产品信息 + 粘贴 1-3 个竞品链接</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 从店铺加载 */}
              {stores.length > 0 && (
                <div className="space-y-2">
                  <Label>从我的店铺加载</Label>
                  <Select
                    options={[{ value: '', label: '— 手动输入 —' }, ...stores.map((s: any) => ({ value: s.id, label: s.name }))]}
                    value={selectedStore}
                    onChange={e => loadStoreData(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>平台</Label>
                <Select options={platformOptions} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>品类</Label>
                <Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="如：纸巾、日用百货" />
              </div>

              {/* 你的产品信息 - 现在在上方 */}
              <div className="bg-zinc-800/30 rounded-lg p-4 space-y-3">
                <p className="font-medium text-zinc-300 text-sm">🟢 你的产品</p>
                <div className="space-y-2">
                  <Label>产品名称</Label>
                  <Input value={form.my_product} onChange={e => setForm({...form, my_product: e.target.value})} placeholder="你的产品名称" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>价格（¥）</Label>
                    <Input value={form.my_price} onChange={e => setForm({...form, my_price: e.target.value})} placeholder="29.9" />
                  </div>
                  <div className="space-y-2">
                    <Label>卖点</Label>
                    <Input value={form.my_selling_points} onChange={e => setForm({...form, my_selling_points: e.target.value})} placeholder="加厚、不掉毛、吸水强" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>产品描述</Label>
                  <Textarea value={form.my_description} onChange={e => setForm({...form, my_description: e.target.value})} placeholder="你的产品详情页主要描述内容" rows={2} />
                </div>
              </div>

              {/* 产品链接输入 - 现在在下方 */}
              <div className="space-y-3 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <p className="text-sm font-medium text-zinc-300">🔗 粘贴竞品链接（AI 自动分析）</p>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">你的产品链接（选填）</Label>
                    <Input value={form.my_product_url} onChange={e => setForm({...form, my_product_url: e.target.value})} placeholder="你的产品链接" className="bg-zinc-800 border-zinc-700 text-zinc-200" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">竞品 1 链接</Label>
                    <Input value={form.competitor1_url} onChange={e => setForm({...form, competitor1_url: e.target.value})} placeholder="竞品1链接" className="bg-zinc-800 border-zinc-700 text-zinc-200" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">竞品 2 链接（选填）</Label>
                    <Input value={form.competitor2_url} onChange={e => setForm({...form, competitor2_url: e.target.value})} placeholder="竞品2链接（选填）" className="bg-zinc-800 border-zinc-700 text-zinc-200" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-500 text-xs">竞品 3 链接（选填）</Label>
                    <Input value={form.competitor3_url} onChange={e => setForm({...form, competitor3_url: e.target.value})} placeholder="竞品3链接（选填）" className="bg-zinc-800 border-zinc-700 text-zinc-200" />
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full mt-6" size="lg" onClick={analyze} loading={loading}>
              <Crosshair className="w-5 h-5 mr-2" />
              {loading ? 'AI 分析中...' : '开始竞品分析'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>竞品对比分析报告</CardTitle>
            <CardDescription>AI 深度对比分析结果</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {loading ? <Loading text="AI 正在深度对比分析..." />
              : result ? (
                <div className="space-y-4">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(result)}>
                    <Copy className="w-4 h-4 mr-1" /> 复制报告
                  </Button>
                  <div className="bg-zinc-800/30 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 border border-zinc-700/50">{result}</div>
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-500">
                  <Crosshair className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">填写你的产品和竞品链接</p>
                  <p className="text-xs mt-1">AI 将生成详细的竞品对比分析报告</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
