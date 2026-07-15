'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { Mic, Copy, RefreshCw } from 'lucide-react'

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

  async function generate() {
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/ai/live-script', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) || 0, duration: Number(form.duration) || 15 }),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎙️ 直播话术</h1>
        <p className="text-gray-500 text-sm mt-1">AI 生成完整的直播话术脚本，拿来就能用</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>产品信息</CardTitle>
            <CardDescription>输入你的产品和直播需求</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2"><Label>产品名称 *</Label><Input value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} placeholder='如：纯棉T恤' /></div>
              <div className="space-y-2"><Label>产品卖点 *</Label><Textarea value={form.product_features} onChange={e => setForm({...form, product_features: e.target.value})} placeholder='逐条列出卖点，如：\n1. 100%纯棉面料\n2. 不起球不掉色\n3. 透气性好' rows={4} /></div>
              <div className="space-y-2"><Label>目标人群</Label><Input value={form.target_audience} onChange={e => setForm({...form, target_audience: e.target.value})} placeholder='如：20-35岁女性，注重品质' /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>价格（¥）</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                <div className="space-y-2"><Label>直播时长（分钟）</Label><Input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>直播平台</Label><Select options={platformOptions} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} /></div>
                <div className="space-y-2"><Label>话术风格</Label><Select options={styleOptions} value={form.style} onChange={e => setForm({...form, style: e.target.value})} /></div>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg" onClick={generate} loading={loading}>
              <Mic className="w-5 h-5 mr-2" />
              {loading ? 'AI 生成中...' : '生成话术'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>直播话术脚本</CardTitle>
            <CardDescription>可复制到直播间直接使用</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {loading ? <Loading text="AI 正在编写直播脚本..." />
              : result ? (
                <div className="space-y-4">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(result)}>
                    <Copy className="w-4 h-4 mr-1" /> 复制全部
                  </Button>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 border border-purple-100">
                    {result}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">输入产品信息，点击「生成话术」</p>
                  <p className="text-xs mt-1">AI 将生成完整直播脚本</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
