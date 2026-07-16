import { createClient, SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/** 修正 Supabase URL：去掉末尾多余的 /rest/v1/ 或 /auth/v1/ 路径 */
function normalizeUrl(url: string): string {
  return url.replace(/\/?(rest\/v1\/?|auth\/v1\/?)?$/, '')
}

export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!rawUrl) {
      throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_URL 未设置，请在 Vercel 环境变量中配置')
    }
    if (!anonKey) {
      throw new Error('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置，请在 Vercel 环境变量中配置')
    }

    const supabaseUrl = normalizeUrl(rawUrl)

    browserClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return browserClient
}

/** 浏览器端 supabase 实例（懒加载） */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})

/** 服务端客户端（管理员权限，只能在 API Routes 中使用） */
export function createServiceClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!rawUrl || !serviceKey) {
    throw new Error('[Supabase] 服务端环境变量未配置（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）')
  }
  return createClient(normalizeUrl(rawUrl), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/** 获取当前用户订阅状态 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await getSupabase()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

/** 获取用户今日用量 */
export async function getUserUsage(userId: string, type: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await getSupabase()
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
  return data[fieldMap[type] as keyof typeof data] || 0
}
