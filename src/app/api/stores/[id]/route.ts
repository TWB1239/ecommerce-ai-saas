import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getAuthenticatedUser } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

    const { id } = await params
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, store: data })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '获取店铺信息失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('stores')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, store: data })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '更新店铺失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

    const { id } = await params
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '删除店铺失败'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
