'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { formatDate } from '@/lib/utils'
import { Search, PenLine, Mic, TrendingUp, Clock, Eye, X } from 'lucide-react'

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  diagnosis: { label: '店铺诊断', icon: Search, color: 'bg-amber-100 text-amber-800' },
  title_optimize: { label: '标题优化', icon: PenLine, color: 'bg-blue-100 text-blue-800' },
  live_script: { label: '直播话术', icon: Mic, color: 'bg-purple-100 text-purple-800' },
  revenue_analysis: { label: '营业额分析', icon: TrendingUp, color: 'bg-green-100 text-green-800' },
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('analyses').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(50)
    setAnalyses(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? analyses : analyses.filter(a => a.analysis_type === filter)

  if (loading) return <Loading text="加载历史记录..." />

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-600 flex items-center justify-center shadow-lg">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">历史记录</h1>
          <p className="text-xs text-zinc-500">查看所有 AI 分析记录</p>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: '全部' },
          { key: 'diagnosis', label: '店铺诊断' },
          { key: 'title_optimize', label: '标题优化' },
          { key: 'live_script', label: '直播话术' },
          { key: 'revenue_analysis', label: '营业额分析' },
        ].map(t => (
          <button key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t.key ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 记录列表 */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">暂无记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = typeConfig[item.analysis_type] || typeConfig['diagnosis']
            const Icon = cfg.icon
            const summary = item.result?.text ? item.result.text.substring(0, 80) + '...' : (typeof item.result === 'string' ? item.result.substring(0, 80) + '...' : '')
            return (
              <Card key={item.id} className="card-hover cursor-pointer" onClick={() => setSelected(item)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${cfg.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{cfg.label}</Badge>
                        <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">{summary}</p>
                    </div>
                    <Eye className="w-5 h-5 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 详情弹窗 */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{typeConfig[selected.analysis_type]?.label || selected.analysis_type}</Badge>
                <span className="text-sm text-gray-400">{formatDate(selected.created_at)}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {selected.result?.text || (typeof selected.result === 'string' ? selected.result : JSON.stringify(selected.result, null, 2))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
