-- =============================================
-- AI 电商运营助手 - Supabase 数据库 Schema
-- 在 Supabase SQL Editor 中执行此脚本
-- =============================================

-- 1. 用户扩展信息表
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 订阅表
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_tier TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'monthly' | 'yearly'
    status TEXT NOT NULL DEFAULT 'active',    -- 'active' | 'canceled' | 'expired' | 'trialing'
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 店铺表（一次性设定，可多个）
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,               -- 店铺名称
    platform TEXT NOT NULL,           -- 平台: taobao | pinduoduo | jd | shopify | other
    category TEXT,                    -- 主营品类: 女装 | 数码 | 家居 | ...
    monthly_revenue DECIMAL(12,2),   -- 月均营业额
    avg_order_value DECIMAL(10,2),   -- 客单价
    monthly_visitors INTEGER,        -- 月访客数
    conversion_rate DECIMAL(5,2),    -- 转化率 %
    return_rate DECIMAL(5,2),        -- 退货率 %
    profit_margin DECIMAL(5,2),      -- 利润率 %
    main_products TEXT,              -- 主营产品描述
    price_range TEXT,                -- 价格区间: low | mid | high
    has_live_room BOOLEAN DEFAULT FALSE, -- 是否直播
    has_video_account BOOLEAN DEFAULT FALSE, -- 是否有短视频账号
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 分析历史记录表
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    analysis_type TEXT NOT NULL,       -- 'diagnosis' | 'title_optimize' | 'live_script' | 'revenue_analysis' | 'competitor_analysis' | 'review_analysis'
    input_data JSONB,                  -- 用户输入的数据
    result JSONB,                      -- AI 返回的结果
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 使用量统计表
CREATE TABLE IF NOT EXISTS public.usage_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis_count INTEGER DEFAULT 0,
    title_optimize_count INTEGER DEFAULT 0,
    live_script_count INTEGER DEFAULT 0,
    revenue_analysis_count INTEGER DEFAULT 0,
    competitor_analysis_count INTEGER DEFAULT 0,
    review_analysis_count INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- 6. 产品表（批量导入用）
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    description TEXT,
    price DECIMAL(10,2),
    category TEXT,
    image_url TEXT,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== 索引 ==========
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_counts_user_date ON public.usage_counts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);

-- ========== 行级安全性 ==========
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 用户只能看自己的数据
CREATE POLICY "users_own_profiles" ON public.profiles
    FOR ALL USING (auth.uid() = id);
CREATE POLICY "users_own_stores" ON public.stores
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_analyses" ON public.analyses
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_usage" ON public.usage_counts
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_products" ON public.products
    FOR ALL USING (auth.uid() = user_id);

-- ========== 自动创建用户资料 ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    
    INSERT INTO public.subscriptions (user_id, plan_tier, status, trial_start, trial_end)
    VALUES (NEW.id, 'free', 'trialing', NOW(), NOW() + INTERVAL '7 days');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
