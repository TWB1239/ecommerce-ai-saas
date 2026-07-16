import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 浏览器端 Supabase 客户端（单例，惰性初始化）
let browserClient: SupabaseClient | null = null

/** 修正 URL：去掉多余的 /rest/v1/ 或 /auth/v1/ 后缀 */
function cleanUrl(url: string): string {
  return url.trim().replace(/\/?(rest\/v1\/?|auth\/v1\/?)?$/, '')
}

/** 获取浏览器端 Supabase 实例 */
export function getSupabase(): SupabaseClient {
  if (browserClient) return browserClient

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!rawUrl) {
    const msg = '【配置错误】NEXT_PUBLIC_SUPABASE_URL 未设置，请检查 Vercel 环境变量'
    console.error(msg)
    throw new Error(msg)
  }
  if (!anonKey) {
    const msg = '【配置错误】NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置，请检查 Vercel 环境变量'
    console.error(msg)
    throw new Error(msg)
  }

  const url = cleanUrl(rawUrl)
  console.log('[Supabase] 初始化客户端:', url.slice(0, 30) + '...')

  browserClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  return browserClient
}

/** 导入 supabase 即可使用（等价的惰性初始化方式） */
export const supabase = getSupabase()

/** 服务端客户端（管理员权限，仅 API Routes 使用） */
export function createServiceClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!rawUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL 未设置')
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY 未设置')
  return createClient(cleanUrl(rawUrl), serviceKey, {
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
  const fieldMap: Record<string, string> = {
    diagnosis: 'diagnosis_count',
    title_optimize: 'title_optimize_count',
    live_script: 'live_script_count',
    revenue_analysis: 'revenue_analysis_count',
    competitor_analysis: 'competitor_analysis_count',
    review_analysis: 'review_analysis_count',
  }
  const field = fieldMap[type] || 'diagnosis_count'
  return (data as any)[field] || 0
}
