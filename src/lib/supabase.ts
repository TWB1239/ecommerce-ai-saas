import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 浏览器端客户端（懒加载）
let browserClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return browserClient
}

// 兼容旧导入：export const supabase
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})

// 服务端客户端（管理员权限，只能在 API Routes 中使用）
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase server environment variables')
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

const USAGE_FIELDS = {
  diagnosis: 'diagnosis_count',
  title_optimize: 'title_optimize_count',
  live_script: 'live_script_count',
  revenue_analysis: 'revenue_analysis_count',
}

// 获取当前用户订阅状态
export async function getUserSubscription(userId: string) {
  const { data, error } = await getSupabase()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

// 获取用户今日用量
export async function getUserUsage(userId: string, type: keyof typeof USAGE_FIELDS) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await getSupabase()
    .from('usage_counts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  if (error || !data) return 0
  return data[USAGE_FIELDS[type]] || 0
}

// 增加使用量
export async function incrementUsage(userId: string, type: keyof typeof USAGE_FIELDS) {
  const today = new Date().toISOString().split('T')[0]
  const field = USAGE_FIELDS[type]

  const { error } = await getSupabase().rpc('increment_usage', {
    p_user_id: userId,
    p_date: today,
    p_field: field,
  })

  if (error) {
    const { data: existing } = await getSupabase()
      .from('usage_counts')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (existing) {
      await getSupabase()
        .from('usage_counts')
        .update({ [field]: getSupabase().rpc('increment', { x: 1 }) })
        .eq('id', existing.id)
    } else {
      await getSupabase()
        .from('usage_counts')
        .insert({ user_id: userId, date: today, [field]: 1 })
    }
  }
}
