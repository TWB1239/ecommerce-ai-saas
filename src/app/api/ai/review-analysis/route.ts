import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai'
import { getAuthenticatedUser, incrementUsage } from '@/lib/api-auth'
import { webSearch, formatSearchResults } from '@/lib/web-search'

export const runtime = 'nodejs'

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

    // 联网搜索相关行业数据
    let searchContext = ''
    try {
      const category = body.product_category || ''
      if (category) {
        const results = await webSearch(`${category} 电商 客户评价 常见差评 行业数据`, 3)
        if (results.length > 0) {
          searchContext += formatSearchResults(results, category)
        }
      }
    } catch {
      // 搜索失败不影响主流程
    }

    const result = await callAI('review_analysis', body, searchContext)

    incrementUsage(user.id, 'review_analysis').catch(() => {})

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    console.error('Review Analysis API Error:', error)
    const message = error instanceof Error ? error.message : '评价分析失败，请稍后重试'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
