// 类型定义

export interface Store {
  id: string
  user_id: string
  name: string
  platform: 'taobao' | 'pinduoduo' | 'jd' | 'shopify' | 'other'
  category: string
  monthly_revenue: number
  avg_order_value: number
  monthly_visitors: number
  conversion_rate: number
  return_rate: number
  profit_margin: number
  main_products: string
  price_range: 'low' | 'mid' | 'high'
  has_live_room: boolean
  has_video_account: boolean
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  user_id: string
  store_id: string | null
  analysis_type: 'diagnosis' | 'title_optimize' | 'live_script' | 'revenue_analysis'
  input_data: any
  result: any
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_tier: 'free' | 'monthly' | 'yearly'
  status: 'active' | 'canceled' | 'expired' | 'trialing'
  trial_end: string
  current_period_end: string
}

export interface UsageCount {
  diagnosis_count: number
  title_optimize_count: number
  live_script_count: number
  revenue_analysis_count: number
}

export interface Product {
  id: string
  user_id: string
  store_id: string
  name: string
  title: string
  description: string
  price: number
  category: string
  sales_count: number
}

// 诊断表单输入
export interface DiagnosisInput {
  platform: string
  category: string
  monthly_revenue: number
  avg_order_value: number
  monthly_visitors: number
  conversion_rate: number
  return_rate: number
  profit_margin: number
  main_products: string
  problems?: string
  goals?: string
}

// 标题优化输入
export interface TitleOptimizeInput {
  current_title: string
  product_description: string
  category: string
  price: number
  keywords?: string
  platform: string
}

// 直播话术输入
export interface LiveScriptInput {
  product_name: string
  product_features: string
  target_audience: string
  price: number
  duration: number
  platform: string
  style?: string
}

// 营业额分析输入
export interface RevenueAnalysisInput {
  store_name: string
  platform: string
  category: string
  daily_data: {
    date: string
    revenue: number
    visitors: number
    orders: number
    ad_spend: number
  }[]
}
