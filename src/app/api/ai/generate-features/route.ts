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
    if (!body.product_name) {
      return NextResponse.json(
        { success: false, error: '请提供产品名称' },
        { status: 400 }
      )
    }

    const result = await (callAI as any)('generate_features', {
      product_name: body.product_name,
      category: body.category || '',
    })

    incrementUsage(user.id, 'generate_features' as any).catch(() => {})

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    console.error('Generate Features API Error:', error)
    const message = error instanceof Error ? error.message : '卖点生成失败，请稍后重试'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
