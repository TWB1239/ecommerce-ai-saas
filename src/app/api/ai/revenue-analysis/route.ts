import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai'
import { getAuthenticatedUser, incrementUsage } from '@/lib/api-auth'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未登录或登录已过期，请重新登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: '请求体不能为空' },
        { status: 400 }
      )
    }

    const result = await callAI('revenue_analysis', body)

    incrementUsage(user.id, 'revenue_analysis').catch(() => {
      console.error('Failed to increment usage for revenue_analysis')
    })

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    console.error('Revenue Analysis API Error:', error)
    const message = error instanceof Error ? error.message : '营收分析失败，请稍后重试'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
