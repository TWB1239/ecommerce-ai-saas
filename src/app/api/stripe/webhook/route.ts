import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''
    const secretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!secretKey || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2025-02-24' as Stripe.LatestApiVersion })

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'invalid signature'
      return NextResponse.json({ error: `签名验证失败: ${msg}` }, { status: 400 })
    }

    const supabase = createServiceClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id || session.metadata?.user_id
        if (userId && session.subscription) {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subId,
            stripe_customer_id: typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id || '',
            plan_tier: 'pro',
            status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
        break
      }
      case 'invoice.paid': {
        const invoice = event.data.object as any
        const subId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id
        if (subId) {
          const stripeSub: any = await stripe.subscriptions.retrieve(subId)
          const currentPeriodStart = new Date(stripeSub.current_period_start * 1000).toISOString()
          const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()
          await supabase.from('subscriptions').update({
            status: 'active',
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subId)
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        await supabase.from('subscriptions').update({
          status: sub.status === 'active' ? 'active'
            : sub.status === 'past_due' ? 'past_due'
            : sub.status === 'canceled' ? 'canceled'
            : sub.status === 'unpaid' ? 'unpaid'
            : sub.status || 'active',
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)
        break
      }
      default:
        console.log(`未处理的事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Webhook handler failed'
    console.error('Stripe Webhook Error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
