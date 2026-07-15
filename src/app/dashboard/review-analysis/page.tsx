'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { MessageSquare, Copy, RefreshCw } from 'lucide-react'

const reviewTypeOptions = [
  { value: 'all', label: '全部评价分析' },
  { value: 'positive', label: '仅好评分析' },
  { value: 'negative', label: '仅差评分析' },
]

export default function ReviewAnalysisPage() {
  const [form, setForm] = useState({
    product_name: '', product_category: '', platform: 'taobao',
    positive_reviews: '', negative_reviews: '',
    total_reviews: '', positive_count: '', negative_count: '',
    review_type: 'all',
  })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyze() {
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/ai/review-analysis', {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">💬 评价分析助手</h1>
        <p className="text-gray-500 text-sm mt-1">AI 分析产品评价，提取好评卖点、归类差评问题、给出改进建议</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>评价数据</CardTitle>
            <CardDescription>粘贴你的产品评价内容进行分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>产品名称 *</Label>
                  <Input value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} placeholder="如：加厚纸巾" />
                </div>
                <div className="space-y-2">
                  <Label>品类</Label>
                  <Input value={form.product_category} onChange={e => setForm({...form, product_category: e.target.value})} placeholder="如：日用百货" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>平台</Label>
                <Select
                  options={[
                    { value: 'taobao', label: '淘宝' },
                    { value: 'pinduoduo', label: '拼多多' },
                    { value: 'jd', label: '京东' },
                    { value: 'shopify', label: 'Shopify' },
                    { value: 'other', label: '其他' },
                  ]}
                  value={form.platform}
                  onChange={e => setForm({...form, platform: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>总评价数</Label>
                  <Input type="number" value={form.total_reviews} onChange={e => setForm({...form, total_reviews: e.target.value})} placeholder="100" />
                </div>
                <div className="space-y-2">
                  <Label>好评数</Label>
                  <Input type="number" value={form.positive_count} onChange={e => setForm({...form, positive_count: e.target.value})} placeholder="85" />
                </div>
                <div className="space-y-2">
                  <Label>差评数</Label>
                  <Input type="number" value={form.negative_count} onChange={e => setForm({...form, negative_count: e.target.value})} placeholder="15" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>分析类型</Label>
                <Select options={reviewTypeOptions} value={form.review_type} onChange={e => setForm({...form, review_type: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>好评内容（粘贴客户好评原文）</Label>
                <Textarea
                  value={form.positive_reviews}
                  onChange={e => setForm({...form, positive_reviews: e.target.value})}
                  placeholder={'粘贴好评内容，逐条粘贴或用分隔符分隔。例如：\n\n"纸张很厚实，吸水性强，会回购！"\n"质量很好，价格实惠，推荐购买"\n"物流很快，包装完好无损"'}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>差评内容（粘贴客户差评原文）</Label>
                <Textarea
                  value={form.negative_reviews}
                  onChange={e => setForm({...form, negative_reviews: e.target.value})}
                  placeholder={'粘贴差评内容。例如：\n\n"纸张太薄了，一碰水就破"\n"包装破损，收到时箱子已经烂了"\n"和描述的不一样，没有说的那么大包"'}
                  rows={5}
                />
              </div>
            </div>

            <Button className="w-full mt-6" size="lg" onClick={analyze} loading={loading}>
              <MessageSquare className="w-5 h-5 mr-2" />
              {loading ? 'AI 分析中...' : '开始分析评价'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分析报告</CardTitle>
            <CardDescription>AI 将输出结构化评价分析</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {loading ? <Loading text="AI 正在分析评价数据..." />
              : result ? (
                <div className="space-y-4">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(result)}>
                    <Copy className="w-4 h-4 mr-1" /> 复制报告
                  </Button>
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800 border border-green-100">
                    {result}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">粘贴评价内容，点击「开始分析」</p>
                  <p className="text-xs mt-1">AI 将提取卖点、归类差评、给出改进建议</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
