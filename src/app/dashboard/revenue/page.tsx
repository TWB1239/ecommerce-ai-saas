'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { TrendingUp, Plus, Trash2, Copy, RefreshCw } from 'lucide-react'

export default function RevenuePage() {
  const [dailyData, setDailyData] = useState<{ date: string; revenue: number; visitors: number; orders: number; ad_spend: number }[]>([])
  const [newRow, setNewRow] = useState({ date: '', revenue: '', visitors: '', orders: '', ad_spend: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addRow() {
    if (!newRow.date || !newRow.revenue) return
    setDailyData([...dailyData, {
      date: newRow.date,
      revenue: Number(newRow.revenue),
      visitors: Number(newRow.visitors) || 0,
      orders: Number(newRow.orders) || 0,
      ad_spend: Number(newRow.ad_spend) || 0,
    }])
    setNewRow({ date: '', revenue: '', visitors: '', orders: '', ad_spend: '' })
  }

  function removeRow(index: number) {
    setDailyData(dailyData.filter((_, i) => i !== index))
  }

  async function analyze() {
    if (dailyData.length < 3) { setError('至少需要 3 天的数据才能分析'); return }
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/ai/revenue-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_data: dailyData, store_name: '', platform: '', category: '' }),
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
        <h1 className="text-2xl font-bold text-gray-900">📈 营业额分析</h1>
        <p className="text-gray-500 text-sm mt-1">输入每日经营数据，AI 分析趋势并给出优化建议</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>每日数据</CardTitle>
            <CardDescription>添加过去 7 天的经营数据（至少 3 天）</CardDescription>
          </CardHeader>
          <CardContent>
            {/* 添加行 */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              <Input type="date" value={newRow.date} onChange={e => setNewRow({...newRow, date: e.target.value})} className="text-xs" />
              <Input type="number" placeholder='营业额' value={newRow.revenue} onChange={e => setNewRow({...newRow, revenue: e.target.value})} className="text-xs" />
              <Input type="number" placeholder='访客' value={newRow.visitors} onChange={e => setNewRow({...newRow, visitors: e.target.value})} className="text-xs" />
              <Input type="number" placeholder='订单' value={newRow.orders} onChange={e => setNewRow({...newRow, orders: e.target.value})} className="text-xs" />
              <Button size="sm" onClick={addRow} disabled={!newRow.date || !newRow.revenue}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* 数据表格 */}
            {dailyData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">日期</th>
                      <th className="pb-2 font-medium">营业额</th>
                      <th className="pb-2 font-medium">访客</th>
                      <th className="pb-2 font-medium">订单</th>
                      <th className="pb-2 font-medium">广告费</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyData.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2">{row.date}</td>
                        <td className="py-2 font-medium">¥{row.revenue.toLocaleString()}</td>
                        <td className="py-2">{row.visitors}</td>
                        <td className="py-2">{row.orders}</td>
                        <td className="py-2">¥{row.ad_spend.toLocaleString()}</td>
                        <td className="py-2"><button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                还没有数据，请添加每日经营数据
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">共 {dailyData.length} 天数据</span>
              <Button onClick={analyze} loading={loading} disabled={dailyData.length < 3}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {loading ? '分析中...' : '开始分析'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>分析报告</CardTitle>
            <CardDescription>AI 生成的营业额分析</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            {loading ? <Loading text="AI 正在分析经营数据..." />
              : result ? (
                <div className="space-y-4">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(result)}>
                    <Copy className="w-4 h-4 mr-1" /> 复制报告
                  </Button>
                  <div className="bg-gray-50 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {result}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">添加至少 3 天数据后开始分析</p>
                  <p className="text-xs mt-1">AI 将分析趋势并给出增长建议</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
