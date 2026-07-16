'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { PenLine, Copy, Check } from 'lucide-react'

const platformOptions = [
  { value: 'taobao', label: '淘宝' },
  { value: 'pinduoduo', label: '拼多多' },
  { value: 'jd', label: '京东' },
  { value: 'shopify', label: 'Shopify' },
]

export default function TitleOptimizePage() {
  const [form, setForm] = useState({ current_title: '', product_description: '', category: '', price: '', platform: 'taobao', keywords: '', competitor_url: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function optimize() {
    setLoading(true); setError(''); setResult('')
    try {
      const res = await fetch('/api/ai/title-optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.result)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-sky-600/20">
          <PenLine className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">标题优化</h1>
          <p className="text-xs text-zinc-500">AI 智能分析并生成高搜索排名商品标题</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>商品信息</CardTitle></CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <Label className="text-zinc-400 text-xs">当前标题</Label>
                <Input placeholder="例如：2024新款春季女装韩版宽松显瘦连衣裙"
                  value={form.current_title}
                  onChange={e => setForm({...form, current_title: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">产品描述</Label>
                <Textarea placeholder="例如：面料柔软透气，适合日常通勤和约会穿着，三个颜色可选"
                  value={form.product_description}
                  onChange={e => setForm({...form, product_description: e.target.value})}
                  className="mt-1" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-zinc-400 text-xs">品类</Label>
                  <Input placeholder="例如：女装 / 数码配件"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">价格（元）</Label>
                  <Input type="number" placeholder="例如：159"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">平台</Label>
                <Select options={platformOptions} value={form.platform}
                  onChange={e => setForm({...form, platform: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">竞品参考链接（选填）</Label>
                <Input placeholder="粘贴竞品链接，AI分析其卖点"
                  value={form.competitor_url}
                  onChange={e => setForm({...form, competitor_url: e.target.value})}
                  className="mt-1 bg-zinc-800 border-zinc-700 text-zinc-200" />
              </div>
              <Button onClick={optimize} loading={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 shadow-lg shadow-sky-600/20">
                <PenLine className="w-4 h-4 mr-1.5" /> AI 生成优化标题
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Result */}
        <div className="lg:col-span-3">
          {error && <Alert variant="error" className="bg-rose-500/10 border-rose-500/20 text-rose-300">{error}</Alert>}
          {loading && (
            <Card><CardContent className="py-16"><Loading text="AI 正在生成优化方案..." /></CardContent></Card>
          )}
          {result && (
            <Card className="border-sky-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI 优化方案</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard.writeText(result)
                    setCopied(true); setTimeout(() => setCopied(false), 2000)
                  }} className="text-zinc-500 hover:text-zinc-200">
                    {copied ? <><Check className="w-3.5 h-3.5 mr-1" /> 已复制</> : <><Copy className="w-3.5 h-3.5 mr-1" /> 复制</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">{result}</div>
              </CardContent>
            </Card>
          )}
          {!result && !loading && !error && (
            <Card><CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500/10 to-cyan-600/10 border border-sky-500/15 flex items-center justify-center">
                <PenLine className="w-7 h-7 text-sky-400" />
              </div>
              <p className="text-zinc-400 text-sm">在左侧输入商品标题信息</p>
              <p className="text-zinc-600 text-xs mt-1">点击生成，AI 给出 3 个不同策略的优化版本</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  )
}
