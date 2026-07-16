'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { TrendingUp, Plus, Trash2, Copy, Sparkles, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function RevenuePage() {
  const [dailyData, setDailyData] = useState<{ date: string; revenue: number; visitors: number; orders: number; ad_spend: number; refund_amount: number; marketing_expenses: number }[]>([])
  const today = new Date().toISOString().split('T')[0]
  const [newRow, setNewRow] = useState({ date: today, revenue: '', visitors: '', orders: '', ad_spend: '', refund_amount: '', marketing_expenses: '' })
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
      refund_amount: Number(newRow.refund_amount) || 0,
      marketing_expenses: Number(newRow.marketing_expenses) || 0,
    }])
    setNewRow({ date: today, revenue: '', visitors: '', orders: '', ad_spend: '', refund_amount: '', marketing_expenses: '' })
  }

  function removeRow(index: number) {
    setDailyData(dailyData.filter((_, i) => i !== index))
  }

  async function analyze() {
    if (dailyData.length < 3) { setError('至少需要 3 天的数据才能分析'); return }
    setLoading(true); setError(''); setResult('')
    try {
      const res = await fetch('/api/ai/revenue-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_data: dailyData, store_name: '', platform: '', category: '' }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : '分析失败') }
    setLoading(false)
  }

  const chartData = dailyData.map(d => ({
    date: d.date,
    营业额: d.revenue,
    访客: d.visitors,
    订单数: d.orders,
    广告费: d.ad_spend,
    退款金额: d.refund_amount,
    营销费用: d.marketing_expenses,
  }))

  const totals = dailyData.reduce((acc, d) => ({
    revenue: acc.revenue + d.revenue,
    visitors: acc.visitors + d.visitors,
    orders: acc.orders + d.orders,
    ad_spend: acc.ad_spend + d.ad_spend,
    refund_amount: acc.refund_amount + d.refund_amount,
    marketing_expenses: acc.marketing_expenses + d.marketing_expenses,
  }), { revenue: 0, visitors: 0, orders: 0, ad_spend: 0, refund_amount: 0, marketing_expenses: 0 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900 p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.2),transparent_60%)]" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-300" />
            营业额分析
          </h1>
          <p className="text-emerald-200/70 mt-1">输入每日经营数据，AI 帮你深度分析趋势和增长机会</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Entry */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-zinc-900/80 border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-400" />
                添加每日数据
              </CardTitle>
              <CardDescription className="text-zinc-500">至少 3 天数据才能分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-white text-xs font-medium mb-1.5 block">选择日期</Label>
                <div className="relative">
                  <Input type="date" value={newRow.date} onChange={e => setNewRow({...newRow, date: e.target.value})}
                    className="bg-white text-zinc-900 border-zinc-300 focus:border-emerald-500 focus:ring-emerald-500/20
                      [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer
                      [&::-webkit-calendar-picker-indicator]:brightness-0" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-zinc-400 text-xs">营业额 (元)</Label>
                  <Input type="number" placeholder="0" value={newRow.revenue}
                    onChange={e => setNewRow({...newRow, revenue: e.target.value})}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">访客数</Label>
                  <Input type="number" placeholder="0" value={newRow.visitors}
                    onChange={e => setNewRow({...newRow, visitors: e.target.value})}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-zinc-400 text-xs">订单数</Label>
                  <Input type="number" placeholder="0" value={newRow.orders}
                    onChange={e => setNewRow({...newRow, orders: e.target.value})}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">广告费 (元)</Label>
                  <Input type="number" placeholder="0" value={newRow.ad_spend}
                    onChange={e => setNewRow({...newRow, ad_spend: e.target.value})}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-zinc-400 text-xs">退款金额 (元)</Label>
                  <Input type="number" placeholder="0" value={newRow.refund_amount}
                    onChange={e => setNewRow({...newRow, refund_amount: e.target.value})}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">营销费用 (元)</Label>
                  <Input type="number" placeholder="0" value={newRow.marketing_expenses}
                    onChange={e => setNewRow({...newRow, marketing_expenses: e.target.value})}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-zinc-600" />
                </div>
              </div>
              <Button onClick={addRow} variant="default" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500">
                <Plus className="w-4 h-4 mr-1" /> 添加
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {dailyData.length > 0 && (
            <Card className="bg-zinc-900/80 border-white/[0.06]">
              <CardHeader><CardTitle className="text-white text-sm">汇总</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: '总营业额', value: `¥${totals.revenue.toLocaleString()}`, color: 'text-emerald-400' },
                  { label: '总访客', value: totals.visitors.toLocaleString(), color: 'text-blue-400' },
                  { label: '总订单', value: totals.orders.toLocaleString(), color: 'text-purple-400' },
                  { label: '总广告费', value: `¥${totals.ad_spend.toLocaleString()}`, color: 'text-red-400' },
                  { label: '总退款金额', value: `¥${totals.refund_amount.toLocaleString()}`, color: 'text-rose-400' },
                  { label: '总营销费用', value: `¥${totals.marketing_expenses.toLocaleString()}`, color: 'text-orange-400' },
                  { label: '平均客单价', value: totals.orders ? `¥${Math.round(totals.revenue / totals.orders)}` : '—', color: 'text-amber-400' },
                  { label: '广告占比', value: totals.revenue ? `${(totals.ad_spend / totals.revenue * 100).toFixed(1)}%` : '—', color: 'text-zinc-400' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-1 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-zinc-500">{s.label}</span>
                    <span className={`text-sm font-semibold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
                <Button onClick={analyze} loading={loading}
                  className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                  <TrendingUp className="w-4 h-4 mr-1" /> AI 分析趋势
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chart & Result */}
        <div className="lg:col-span-2 space-y-4">
          {/* Data Table + Chart */}
          {dailyData.length > 0 && (
            <Card className="bg-zinc-900/80 border-white/[0.06]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  数据趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#52525b" tick={{ fill: '#52525b', fontSize: 12 }} />
                      <YAxis stroke="#52525b" tick={{ fill: '#52525b', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                      <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                      <Line type="monotone" dataKey="营业额" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                      <Line type="monotone" dataKey="访客" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                      <Line type="monotone" dataKey="订单数" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7' }} />
                      <Line type="monotone" dataKey="广告费" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                      <Line type="monotone" dataKey="退款金额" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e' }} />
                      <Line type="monotone" dataKey="营销费用" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-2 px-2 text-zinc-500 font-medium">日期</th>
                        <th className="text-right py-2 px-2 text-zinc-500 font-medium">营业额</th>
                        <th className="text-right py-2 px-2 text-zinc-500 font-medium">访客</th>
                        <th className="text-right py-2 px-2 text-zinc-500 font-medium">订单</th>
                        <th className="text-right py-2 px-2 text-zinc-500 font-medium">广告费</th>
                        <th className="text-right py-2 px-2 text-zinc-500 font-medium">退款金额</th>
                        <th className="text-right py-2 px-2 text-zinc-500 font-medium">营销费用</th>
                        <th className="text-center py-2 px-2 text-zinc-500 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.map((d, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="py-2 px-2 text-white">{d.date}</td>
                          <td className="text-right py-2 px-2 text-emerald-400">¥{d.revenue.toLocaleString()}</td>
                          <td className="text-right py-2 px-2 text-blue-400">{d.visitors.toLocaleString()}</td>
                          <td className="text-right py-2 px-2 text-purple-400">{d.orders}</td>
                          <td className="text-right py-2 px-2 text-red-400">¥{d.ad_spend.toLocaleString()}</td>
                          <td className="text-right py-2 px-2 text-rose-400">¥{d.refund_amount.toLocaleString()}</td>
                          <td className="text-right py-2 px-2 text-orange-400">¥{d.marketing_expenses.toLocaleString()}</td>
                          <td className="text-center py-2 px-2">
                            <button onClick={() => removeRow(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {error && <Alert variant="error" className="bg-red-500/10 border-red-500/20 text-red-300">{error}</Alert>}

          {loading && <Loading text="AI 分析中..." />}

          {/* AI Result */}
          {result && (
            <Card className="bg-zinc-900/80 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI 分析报告
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-mono">
                  {result}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(result)}
                  className="mt-4 border-white/10 text-zinc-400 hover:text-white hover:border-white/20">
                  <Copy className="w-3.5 h-3.5 mr-1" /> 复制结果
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {dailyData.length === 0 && !result && (
            <Card className="bg-zinc-900/80 border-white/[0.06]">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-400" />
                </div>
                <p className="text-zinc-400">在左侧添加每日经营数据</p>
                <p className="text-zinc-600 text-sm mt-1">至少 3 天数据，AI 就能分析趋势和增长机会</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
