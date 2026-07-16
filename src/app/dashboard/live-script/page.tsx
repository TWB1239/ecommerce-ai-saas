'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { Mic, Copy, Check, Sparkles } from 'lucide-react'

const platformOptions = [
  { value: 'taobao', label: '淘宝直播' },
  { value: 'douyin', label: '抖音' },
  { value: 'kuaishou', label: '快手' },
  { value: 'other', label: '其他' },
]
const styleOptions = [
  { value: 'professional', label: '专业讲解型' },
  { value: 'friendly', label: '亲切聊天型' },
  { value: 'funny', label: '搞笑互动型' },
  { value: 'urgent', label: '紧迫逼单型' },
]

export default function LiveScriptPage() {
  const [form, setForm] = useState({
    product_name: '', product_features: '', target_audience: '',
    price: '', duration: '15', platform: 'taobao', style: 'professional'
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [generatingFeatures, setGeneratingFeatures] = useState(false)

  async function generateFeatures() {
    if (!form.product_name.trim()) return
    setGeneratingFeatures(true)
    try {
      const res = await fetch('/api/ai/generate-features', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: form.product_name, category: '' }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setForm(prev => ({ ...prev, product_features: data.result }))
    } catch (e: any) { setError(e.message) }
    setGeneratingFeatures(false)
  }

  async function generate() {
    setLoading(true); setError(''); setResult('')
    try {
      const res = await fetch('/api/ai/live-script', {
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">直播话术</h1>
          <p className="text-xs text-zinc-500">AI 自动生成完整直播带货脚本，拿来就能用</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>产品信息</CardTitle></CardHeader>
            <CardContent className="space-y-3.5">
              <div>
                <Label className="text-zinc-400 text-xs">产品名称</Label>
                <Input placeholder="例如：加厚厨房纸巾"
                  value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})}
                  className="mt-1" />
              </div>
              <div>
                <div className="flex items-center justify-between mt-1">
                  <Label className="text-zinc-400 text-xs">产品卖点（逐条列出）</Label>
                  {form.product_name.trim() && (
                    <Button variant="ghost" size="sm" onClick={generateFeatures} loading={generatingFeatures}
                      className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 -mr-2 -mt-1">
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> AI 生成卖点
                    </Button>
                  )}
                </div>
                <Textarea placeholder="例如：1. 4层加厚设计 2. 吸水性强不易破 3. 食品级安全 4. 性价比高"
                  value={form.product_features} onChange={e => setForm({...form, product_features: e.target.value})}
                  className="mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-zinc-400 text-xs">目标人群</Label>
                  <Input placeholder="例如：家庭主妇 25-45岁"
                    value={form.target_audience} onChange={e => setForm({...form, target_audience: e.target.value})}
                    className="mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">价格（元）</Label>
                  <Input type="number" placeholder="例如：39.9"
                    value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-zinc-400 text-xs">直播时长</Label>
                  <Select options={[
                    { value: '10', label: '10分钟' }, { value: '15', label: '15分钟' },
                    { value: '20', label: '20分钟' }, { value: '30', label: '30分钟' },
                  ]} value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                    className="mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">平台</Label>
                  <Select options={platformOptions} value={form.platform}
                    onChange={e => setForm({...form, platform: e.target.value})}
                    className="mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">风格</Label>
                  <Select options={styleOptions} value={form.style}
                    onChange={e => setForm({...form, style: e.target.value})}
                    className="mt-1" />
                </div>
              </div>
              <Button onClick={generate} loading={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 shadow-lg shadow-violet-600/20">
                <Mic className="w-4 h-4 mr-1.5" /> AI 生成话术
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {error && <Alert variant="error" className="bg-rose-500/10 border-rose-500/20 text-rose-300">{error}</Alert>}
          {loading && <Card><CardContent className="py-16"><Loading text="AI 正在生成直播话术..." /></CardContent></Card>}
          {result && (
            <Card className="border-violet-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>直播话术脚本</CardTitle>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/15 flex items-center justify-center">
                <Mic className="w-7 h-7 text-violet-400" />
              </div>
              <p className="text-zinc-400 text-sm">在左侧填写产品信息</p>
              <p className="text-zinc-600 text-xs mt-1">AI 生成包含开场/讲品/互动/逼单的完整脚本</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  )
}
