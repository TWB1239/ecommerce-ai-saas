/**
 * 简易 Supabase 认证服务
 *
 * 直接使用 fetch 调用 Supabase REST API，绕过 @supabase/supabase-js SDK 的兼容问题。
 * 适用场景：登录、注册、获取用户信息。
 */

const SUPABASE_URL = 'https://yqfzhlgazxjpafbsnugm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxZnpobGdhenhqcGFmYnNudWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjY4NjQsImV4cCI6MjA5OTcwMjg2NH0.LhY7oAtL0RO45Rlt79yknCnISGq9Z64Kac7PrpNw6tQ'

interface AuthResponse {
  data?: { user: any; session: any }
  error?: { message: string; status: number }
}

/** 邮箱密码注册 */
export async function signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
        data: { name: name || email.split('@')[0] },
        gotrue_meta_security: {},
      }),
    })

    const body = await res.json()

    if (!res.ok) {
      return { error: { message: body.msg || body.error_description || body.error || '注册失败', status: res.status } }
    }

    return { data: body }
  } catch (err: any) {
    return { error: { message: err?.message || '网络错误，请检查网络连接', status: 0 } }
  }
}

/** 邮箱密码登录 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    const body = await res.json()

    if (!res.ok) {
      return { error: { message: body.msg || body.error_description || body.error || '登录失败', status: res.status } }
    }

    // 保存 session 到 localStorage，供页面刷新后保持登录
    if (body.access_token) {
      localStorage.setItem('supabase_session', JSON.stringify(body))
    }

    return { data: body }
  } catch (err: any) {
    return { error: { message: err?.message || '网络错误，请检查网络连接', status: 0 } }
  }
}

/** 获取当前登录用户 */
export async function getCurrentUser(): Promise<any> {
  try {
    const sessionStr = localStorage.getItem('supabase_session')
    if (!sessionStr) return null

    const session = JSON.parse(sessionStr)
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/** 退出登录 */
export async function signOut() {
  localStorage.removeItem('supabase_session')
}
