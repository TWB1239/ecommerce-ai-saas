import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getAuthenticatedUser } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, stores })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '获取店铺列表失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('stores')
      .insert({ ...body, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, store: data })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '创建店铺失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
