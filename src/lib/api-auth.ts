import { createClient } from '@supabase/supabase-js'

/**
 * 懒创建 Supabase 服务端客户端（仅在调用时初始化）
 * 避免 lib/supabase.ts 的模块级副作用导致构建失败
 */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * 增加 AI 功能使用量
 */
export async function incrementUsage(userId: string, type: 'diagnosis' | 'title_optimize' | 'live_script' | 'revenue_analysis' | 'competitor_analysis' | 'review_analysis') {
  const today = new Date().toISOString().split('T')[0]
  const fieldMap: Record<string, string> = {
    diagnosis: 'diagnosis_count',
    title_optimize: 'title_optimize_count',
    live_script: 'live_script_count',
    revenue_analysis: 'revenue_analysis_count',
    competitor_analysis: 'competitor_analysis_count',
    review_analysis: 'review_analysis_count',
  }
  const field = fieldMap[type]
  if (!field) return

  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('usage_counts')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existing) {
    // 通过 RPC 或直接增量更新
    const { error: rpcError } = await supabase
      .rpc('increment_usage', { p_user_id: userId, p_date: today, p_field: field })

    if (rpcError) {
      // fallback: 获取当前值 +1
      const { data: current } = await supabase
        .from('usage_counts')
        .select(field)
        .eq('id', existing.id)
        .single()

      const newCount = (current?.[field as keyof typeof current] as number || 0) + 1
      await supabase
        .from('usage_counts')
        .update({ [field]: newCount })
        .eq('id', existing.id)
    }
  } else {
    await supabase
      .from('usage_counts')
      .insert({ user_id: userId, date: today, [field]: 1 })
  }
}

/**
 * 从 Request 中提取并验证 Supabase access_token
 * 优先从 Authorization header 提取，其次从 cookie 读取
 */
export async function getAuthenticatedUser(request: Request) {
  // 1. 尝试 Authorization: Bearer <token>
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createServiceClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) return user
  }

  // 2. 尝试从 cookie 读取（sb-*-auth-token 格式）
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/sb-[^-]+-auth-token=([^;]+)/)
  if (tokenMatch) {
    try {
      const tokenJson = JSON.parse(decodeURIComponent(tokenMatch[1]))
      const accessToken = Array.isArray(tokenJson) ? tokenJson[0] : tokenJson.access_token
      if (accessToken) {
        const supabase = createServiceClient()
        const { data: { user }, error } = await supabase.auth.getUser(accessToken)
        if (!error && user) return user
      }
    } catch {
      // cookie 解析失败
    }
  }

  return null
}
