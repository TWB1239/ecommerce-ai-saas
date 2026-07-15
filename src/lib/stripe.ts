import Stripe from 'stripe'

let stripeClient: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
    stripeClient = new Stripe(key, { apiVersion: '2025-02-24' as any })
  }
  return stripeClient
}

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || '',
  yearly: process.env.STRIPE_PRICE_YEARLY || '',
}

export const PLAN_CONFIG = {
  monthly: { name: '专业版（月付）', price: 9900, interval: 'month' as const },
  yearly: { name: '专业版（年付）', price: 79900, interval: 'year' as const },
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  customerEmail?: string
) {
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card', 'alipay'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: customerEmail,
    client_reference_id: userId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=canceled`,
    metadata: { user_id: userId },
  })
  return session
}

export async function cancelSubscription(subscriptionId: string) {
  return await getStripe().subscriptions.cancel(subscriptionId)
}

// 为 webhook handler 导出，也懒加载
export { getStripe as stripe }
