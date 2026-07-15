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
import { Search, Save, Copy, RefreshCw } from 'lucide-react'

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
      problems: '',
      goals: '',
    })
  }

  async function runDiagnosis() {
    setLoading(true)
    setError('')
    setResult('')
    setSaved(false)
    try {
      const res = await fetch('/api/ai/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  async function saveResult() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !result) return
    await supabase.from('analyses').insert({
      user_id: user.id,
      analysis_type: 'diagnosis',
      input_data: form,
      result: { text: result },
    })
    setSaved(true)
  }

  function copyResult() {
    navigator.clipboard.writeText(result)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔍 店铺诊断</h1>
        <p className="text-gray-500 text-sm mt-1">填写店铺数据，AI 专业诊断问题并给出优化方案</p>
      </div>

      {/* 选择已有店铺 */}
      {stores.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">从已有店铺加载：</span>
          <Select options={[{ value: '', label: '手动填写' }, ...stores.map((s: any) => ({ value: s.id, label: s.name }))]}
            value={selectedStore} onChange={(e) => loadStoreData(e.target.value)} className="w-64" placeholder="选择店铺..." />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：表单 */}
        <Card>
          <CardHeader>
            <CardTitle>店铺信息</CardTitle>
            <CardDescription>填写越详细，诊断越精准</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>电商平台</Label><Select options={platformOptions} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} /></div>
              <div className="space-y-2"><Label>主营品类</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder='女装、数码、家居...' /></div>
              <div className="space-y-2"><Label>月营业额（¥）</Label><Input type="number" value={form.monthly_revenue} onChange={e => setForm({...form, monthly_revenue: e.target.value})} /></div>
              <div className="space-y-2"><Label>客单价（¥）</Label><Input type="number" value={form.avg_order_value} onChange={e => setForm({...form, avg_order_value: e.target.value})} /></div>
              <div className="space-y-2"><Label>月访客数</Label><Input type="number" value={form.monthly_visitors} onChange={e => setForm({...form, monthly_visitors: e.target.value})} /></div>
              <div className="space-y-2"><Label>转化率（%）</Label><Input type="number" step="0.1" value={form.conversion_rate} onChange={e => setForm({...form, conversion_rate: e.target.value})} /></div>
              <div className="space-y-2"><Label>退货率（%）</Label><Input type="number" step="0.1" value={form.return_rate} onChange={e => setForm({...form, return_rate: e.target.value})} /></div>
              <div className="space-y-2"><Label>利润率（%）</Label><Input type="number" step="0.1" value={form.profit_margin} onChange={e => setForm({...form, profit_margin: e.target.value})} /></div>
              <div className="col-span-2 space-y-2"><Label>主营产品</Label><Textarea value={form.main_products} onChange={e => setForm({...form, main_products: e.target.value})} placeholder='描述你的主要产品' /></div>
              <div className="col-span-2 space-y-2"><Label>目前遇到的问题（选填）</Label><Textarea value={form.problems} onChange={e => setForm({...form, problems: e.target.value})} placeholder='如：流量下降、转化率低、退货率高...' /></div>
              <div className="col-span-2 space-y-2"><Label>期望目标（选填）</Label><Textarea value={form.goals} onChange={e => setForm({...form, goals: e.target.value})} placeholder='如：提升转化率到3%、月销100万...' /></div>
            </div>
            <Button className="w-full mt-6" size="lg" onClick={runDiagnosis} loading={loading}>
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'AI 诊断中...' : '开始诊断'}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧：结果 */}
        <Card>
          <CardHeader>
            <CardTitle>诊断报告</CardTitle>
            <CardDescription>AI 分析结果将在这里展示</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            
            {loading ? (
              <Loading text="AI 正在分析你的店铺数据..." />
            ) : result ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={saveResult}>
                    <Save className="w-4 h-4 mr-1" /> {saved ? '已保存' : '保存结果'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyResult}>
                    <Copy className="w-4 h-4 mr-1" /> 复制
                  </Button>
                  <Button size="sm" variant="ghost" onClick={runDiagnosis}>
                    <RefreshCw className="w-4 h-4 mr-1" /> 重新生成
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                  {result}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">填写左侧表单，点击「开始诊断」</p>
                <p className="text-xs mt-1">AI 将分析你的数据并生成专业报告</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
