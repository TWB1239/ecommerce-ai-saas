/**
 * Supabase 认证服务
 *
 * 统一使用环境变量（与 supabase.ts 同一来源），
 * 用 fetch 调用 Supabase REST API 实现登录/注册。
 */

import { supabase } from './supabase'

// 从环境变量读取 Supabase 配置（与 supabase.ts 同一来源）
const SUPABASE_URL =
  (typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : '') || ''
const SUPABASE_ANON_KEY =
  (typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : '') || ''

// 修正 URL
const cleanUrl = SUPABASE_URL.replace(/\/?(rest\/v1\/?|auth\/v1\/?)?$/, '')

interface AuthResponse {
  data?: Record<string, any> & {
    user?: any
    access_token?: string
    refresh_token?: string
  }
  error?: { message: string; status: number }
}

/** 邮箱密码注册 */
export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  try {
    if (!cleanUrl || !SUPABASE_ANON_KEY) {
      return {
        error: {
          message:
            '系统未配置数据库连接，请检查 .env.local 文件中的 Supabase 配置',
          status: 0,
        },
      }
    }

    const res = await fetch(`${cleanUrl}/auth/v1/signup`, {
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
      // 处理 Supabase 项目被暂停的错误
      if (res.status === 503 || body?.error?.includes('pausing')) {
        return {
          error: {
            message:
              '数据库服务暂时不可用（免费版 Supabase 可能已自动暂停），请登录 supabase.com 重新激活项目',
            status: res.status,
          },
        }
      }
      return {
        error: {
          message:
            body.msg ||
            body.error_description ||
            body.error ||
            '注册失败',
          status: res.status,
        },
      }
    }

    return { data: body }
  } catch (err: any) {
    return {
      error: {
        message: err?.message || '网络错误，请检查网络连接',
        status: 0,
      },
    }
  }
}

/** 邮箱密码登录 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    if (!cleanUrl || !SUPABASE_ANON_KEY) {
      return {
        error: {
          message:
            '系统未配置数据库连接，请检查 .env.local 文件中的 Supabase 配置',
          status: 0,
        },
      }
    }

    const res = await fetch(`${cleanUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    const body = await res.json()

    if (!res.ok) {
      // 处理 Supabase 项目被暂停
      if (res.status === 503 || body?.error?.includes('pausing')) {
        return {
          error: {
            message:
              '数据库服务暂时不可用（免费版 Supabase 可能已自动暂停），请登录 supabase.com 重新激活项目',
            status: res.status,
          },
        }
      }
      return {
        error: {
          message:
            body.msg ||
            body.error_description ||
            body.error ||
            '登录失败',
          status: res.status,
        },
      }
    }

    // 保存 session 到 localStorage + SDK
    if (body.access_token) {
      localStorage.setItem('supabase_session', JSON.stringify(body))
      // 同步设置到 SDK — 用同一个 SDK 客户端，确保 dashboard 能读到
      await supabase.auth.setSession({
        access_token: body.access_token,
        refresh_token: body.refresh_token || '',
      })
    }

    return { data: body }
  } catch (err: any) {
    return {
      error: {
        message: err?.message || '网络错误，请检查网络连接',
        status: 0,
      },
    }
  }
}

/** 获取当前登录用户（备用方法） */
export async function getCurrentUser(): Promise<any> {
  try {
    if (!cleanUrl || !SUPABASE_ANON_KEY) return null

    const sessionStr = localStorage.getItem('supabase_session')
    if (!sessionStr) return null

    const session = JSON.parse(sessionStr)
    const res = await fetch(`${cleanUrl}/auth/v1/user`, {
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
  await supabase.auth.signOut()
}
