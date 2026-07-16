'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { formatPrice, getPlatformLabel } from '@/lib/utils'
import { Store, Plus, Edit3, Trash2, Download, Upload } from 'lucide-react'

const platformOptions = [
  { value: 'taobao', label: '淘宝' },
  { value: 'pinduoduo', label: '拼多多' },
  { value: 'jd', label: '京东' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'other', label: '其他' },
]
const priceRangeOptions = [
  { value: 'low', label: '低价（<50元）' },
  { value: 'mid', label: '中价（50-200元）' },
  { value: 'high', label: '高价（>200元）' },
]

const defaultForm = {
  name: '', platform: 'taobao', category: '', monthly_revenue: 0,
  avg_order_value: 0, monthly_visitors: 0, conversion_rate: 0,
  return_rate: 0, profit_margin: 0, main_products: '',
  price_range: 'mid', has_live_room: false, has_video_account: false,
}

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadStores() }, [])

  async function loadStores() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('stores').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setStores(data || [])
    setLoading(false)
  }

  async function saveStore() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (editingId) {
      await supabase.from('stores').update(form).eq('id', editingId)
    } else {
      await supabase.from('stores').insert({ ...form, user_id: user.id })
    }
    setShowForm(false)
    setEditingId(null)
    setForm(defaultForm)
    setSaving(false)
    loadStores()
  }

  function editStore(store: any) {
    setForm(store)
    setEditingId(store.id)
    setShowForm(true)
  }

  async function deleteStore(id: string) {
    if (!confirm('确定删除这个店铺？')) return
    await supabase.from('stores').delete().eq('id', id)
    loadStores()
  }

  function exportCSV() {
    const headers = ['店铺名', '平台', '品类', '月营业额', '客单价', '月访客', '转化率%', '退货率%']
    const rows = stores.map(s => [s.name, getPlatformLabel(s.platform), s.category, s.monthly_revenue, s.avg_order_value, s.monthly_visitors, s.conversion_rate, s.return_rate])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = '我的店铺数据.csv'; a.click()
  }

  if (loading) return <Loading text="加载店铺列表..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">我的店铺</h1>
          <p className="text-zinc-400 text-sm">管理你的店铺信息，一次设定，永久使用</p>
        </div>
        <div className="flex gap-2">
          {stores.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-1" /> 导出
            </Button>
          )}
          <Button onClick={() => { setForm(defaultForm); setEditingId(null); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-1" /> 新增店铺
          </Button>
        </div>
      </div>

      {/* 店铺表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">{editingId ? '编辑店铺' : '新增店铺'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>店铺名称 *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="输入店铺名称" required /></div>
              <div className="space-y-2"><Label>平台</Label><Select options={platformOptions} value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} /></div>
              <div className="space-y-2"><Label>主营品类</Label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder='如：女装、数码' /></div>
              <div className="space-y-2"><Label>价格区间</Label><Select options={priceRangeOptions} value={form.price_range} onChange={e => setForm({...form, price_range: e.target.value})} /></div>
              <div className="space-y-2"><Label>月营业额（¥）</Label><Input type="number" value={form.monthly_revenue} onChange={e => setForm({...form, monthly_revenue: Number(e.target.value)})} placeholder="0" /></div>
              <div className="space-y-2"><Label>客单价（¥）</Label><Input type="number" value={form.avg_order_value} onChange={e => setForm({...form, avg_order_value: Number(e.target.value)})} placeholder="0" /></div>
              <div className="space-y-2"><Label>月访客数</Label><Input type="number" value={form.monthly_visitors} onChange={e => setForm({...form, monthly_visitors: Number(e.target.value)})} placeholder="0" /></div>
              <div className="space-y-2"><Label>转化率（%）</Label><Input type="number" step="0.1" value={form.conversion_rate} onChange={e => setForm({...form, conversion_rate: Number(e.target.value)})} placeholder="0" /></div>
              <div className="space-y-2"><Label>退货率（%）</Label><Input type="number" step="0.1" value={form.return_rate} onChange={e => setForm({...form, return_rate: Number(e.target.value)})} placeholder="0" /></div>
              <div className="space-y-2"><Label>利润率（%）</Label><Input type="number" step="0.1" value={form.profit_margin} onChange={e => setForm({...form, profit_margin: Number(e.target.value)})} placeholder="0" /></div>
              <div className="col-span-2 space-y-2"><Label>主营产品描述</Label><textarea className="flex min-h-[80px] w-full rounded-lg border border-white/[0.15] bg-white/[0.05] px-3 py-2 text-sm text-white/90 placeholder:text-zinc-500 hover:border-white/[0.25] hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 focus:shadow-[0_0_16px_rgba(168,85,247,0.20)] transition-all duration-200 resize-y" value={form.main_products} onChange={e => setForm({...form, main_products: e.target.value})} placeholder="描述主营产品，如：男装T恤、电子产品配件" /></div>
              <div className="col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" checked={form.has_live_room} onChange={e => setForm({...form, has_live_room: e.target.checked})} className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] text-purple-600 focus:ring-purple-500/40" />
                  有直播间
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" checked={form.has_video_account} onChange={e => setForm({...form, has_video_account: e.target.checked})} className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.05] text-purple-600 focus:ring-purple-500/40" />
                  有短视频账号
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowForm(false)}>取消</Button>
              <Button onClick={saveStore} loading={saving}>{editingId ? '保存修改' : '添加店铺'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* 店铺列表 */}
      {stores.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Store className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400 mb-2">还没有添加店铺</p>
            <p className="text-sm text-zinc-500 mb-4">添加店铺后，诊断和分析会自动加载店铺信息</p>
            <Button onClick={() => { setForm(defaultForm); setEditingId(null); setShowForm(true) }}>
              <Plus className="w-4 h-4 mr-1" /> 添加你的第一个店铺
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <Card key={store.id} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{store.name}</h3>
                    <Badge variant="outline" className="mt-1">{getPlatformLabel(store.platform)}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editStore(store)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteStore(store.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-zinc-500">品类</span><span className="text-zinc-300">{store.category || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">月营业额</span><span className="font-medium text-white">{formatPrice(store.monthly_revenue || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">转化率</span><span className="text-zinc-300">{store.conversion_rate || 0}%</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">退货率</span><span className="text-zinc-300">{store.return_rate || 0}%</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
