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
import { PenLine, Copy, RefreshCw, Save, Check } from 'lucide-react'

const platformOptions = [
  { value: 'taobao', label: '淘宝' },
  { value: 'pinduoduo', label: '拼多多' },
  { value: 'jd', label: '京东' },
  { value: 'shopify', label: 'Shopify' },
]

export default function TitleOptimizePage() {
  const [form, setForm] = useState({ current_title: '', product_description: '', category: '', price: '', platform: 'taobao', keywords: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function optimize() {
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/ai/title-optimize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) || 0 }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.result)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  function copyAll() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">✏️ 标题优化</h1>
        <p className="text-gray-500 text-sm mt-1">AI 分析标题问题，生成 3 个优化版本提升搜索排名</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>标题信息</CardTitle>
            <CardDescription>输入当前标题和产品信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2"><Label>当前标题 *</Label><Input value={form.current_title} onChange={e => setForm({...form, current_title: e.target.value})} placeholder='输入产品当前使用的标题' /></div>
              <div className="space-y-2"><Label>产品描述</Label><Textarea value={form.product_description} onChange={e => setForm({...form, product_description: e.target.value})} placeholder='产品的主要卖点和特色' /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>品类</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder='如：连衣裙' /></div>
                <div className="space-y-2"><Label>价格（¥）</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder='99' /></div>
              </div>
              <div className="space-y-2"><Label>平台</Label><Select options={platformOptions} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} /></div>
              <div className="space-y-2"><Label>目标关键词（选填）</Label><Input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder='希望包含的关键词，逗号分隔' /></div>
            </div>
            <Button className="w-full mt-6" size="lg" onClick={optimize} loading={loading}>
              <PenLine className="w-5 h-5 mr-2" />
              {loading ? 'AI 优化中...' : '开始优化'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>优化结果</CardTitle>
            <CardDescription>AI 生成的优化标题和建议</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {loading ? <Loading text="AI 正在生成优化方案..." />
              : result ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyAll}>
                      {copied ? <><Check className="w-4 h-4 mr-1" /> 已复制</> : <><Copy className="w-4 h-4 mr-1" /> 复制全部</>}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={optimize}><RefreshCw className="w-4 h-4 mr-1" /> 重新生成</Button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{result}</div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <PenLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">输入标题信息，点击「开始优化」</p>
                  <p className="text-xs mt-1">AI 将生成 3 个不同策略的优化版本</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
