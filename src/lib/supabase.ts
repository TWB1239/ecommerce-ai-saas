import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase 浏览器端客户端
 *
 * 注意：这个文件只在 'use client' 组件中导入。
 * API Routes 请使用 api-auth.ts 中的 createServiceClient()。
 */

// 从环境变量读取配置（NEXT_PUBLIC_* 在构建时会被替换为实际值）
const supabaseUrl = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '') || ''
const supabaseAnonKey = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') || ''

// 修正 URL：去掉末尾多余的 /rest/v1/ 或 /auth/v1/
const cleanUrl = supabaseUrl.replace(/\/?(rest\/v1\/?|auth\/v1\/?)?$/, '')

// 创建并导出 supabase 客户端（同步初始化，简单直接）
export const supabase: SupabaseClient = createClient(cleanUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/** 服务端客户端（管理员权限，仅 API Routes 中使用） */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/?(rest\/v1\/?|auth\/v1\/?)?$/, '') || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** 获取用户今日用量 */
export async function getUserUsage(userId: string, type: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('usage_counts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  if (error || !data) return 0
  const fields: Record<string, string> = {
    diagnosis: 'diagnosis_count',
    title_optimize: 'title_optimize_count',
    live_script: 'live_script_count',
    revenue_analysis: 'revenue_analysis_count',
    competitor_analysis: 'competitor_analysis_count',
    review_analysis: 'review_analysis_count',
  }
  return (data as any)[fields[type] || 'diagnosis_count'] || 0
}
