import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, email } = await request.json()
    
    if (!priceId || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const session = await createCheckoutSession(userId, priceId, email)
    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error('Create Checkout API Error:', error)
    const message = error instanceof Error ? error.message : '创建支付会话失败，请稍后重试'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
