import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai'
import { getAuthenticatedUser, incrementUsage } from '@/lib/api-auth'
import { webSearch, formatSearchResults, getEnhancedSystemPrompt } from '@/lib/web-search'

export const runtime = 'nodejs' // web-search uses fetch

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

    // 联网搜索：根据竞品名称获取实时信息
    let searchContext = ''
    try {
      const searchQueries: string[] = []
      if (body.competitor1_name) searchQueries.push(body.competitor1_name)
      if (body.competitor2_name) searchQueries.push(body.competitor2_name)
      if (body.competitor3_name) searchQueries.push(body.competitor3_name)
      if (body.category) searchQueries.push(`${body.category} 电商 行业数据`)

      for (const query of searchQueries.slice(0, 3)) {
        const results = await webSearch(query, 3)
        if (results.length > 0) {
          searchContext += formatSearchResults(results, query)
        }
      }
    } catch {
      // 搜索失败不影响主流程
    }

    const result = await callAI('competitor_analysis', body, searchContext)

    incrementUsage(user.id, 'competitor_analysis').catch(() => {})

    return NextResponse.json({ success: true, result })
  } catch (error: unknown) {
    console.error('Competitor Analysis API Error:', error)
    const message = error instanceof Error ? error.message : '竞品分析失败，请稍后重试'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
