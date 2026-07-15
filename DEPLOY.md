# AI 电商运营助手 — 部署指南

> 面向零基础用户，按步骤操作即可上线。

---

## 第一步：注册账号（15 分钟）

### 1.1 注册 GitHub
1. 打开 https://github.com/signup
2. 输入邮箱，设置密码，完成注册
3. 注册后将代码上传：稍后我会告诉你方法

### 1.2 注册 Vercel（免费托管）
1. 打开 https://vercel.com/signup
2. 点击 "Continue with GitHub" 用 GitHub 账号登录
3. 选择个人计划（Hobby，免费）
4. 验证手机号

### 1.3 注册 Supabase（免费数据库 + 认证）
1. 打开 https://supabase.com/dashboard/sign-up
2. 用 GitHub 登录
3. 创建一个新项目：
   - **Name:** `ecommerce-ai-saas`
   - **Database Password:** 设置一个密码（记下来）
   - **Region:** 选择 `Singapore`（离中国最近，速度快）
   - 点击 "Create new project"
4. 等待 1-2 分钟项目创建完成
5. 创建完成后，在左侧菜单找到 **SQL Editor**
6. 打开 `supabase/schema.sql` 文件（本项目的文件）
7. 全选复制内容，粘贴到 SQL Editor
8. 点击 **Run** 执行

### 1.4 注册 DeepSeek（AI 引擎）
1. 打开 https://platform.deepseek.com
2. 注册账号并登录
3. 左侧菜单找到 **API Keys**
4. 点击 **Create API key**
5. 复制生成的 key（只会显示一次，马上保存）

### 1.5 注册 Stripe（支付）
1. 打开 https://dashboard.stripe.com/register
2. 填写邮箱、姓名、密码
3. 激活账号
4. 创建两个产品：
   - 左侧菜单 **产品** → **新增**
   - **月付产品：** 名称 "专业版月付"，定价 ¥99/月
   - 保存后复制 **API ID**（类似 `price_xxxxxxxxxxxx`）
   - **年付产品：** 名称 "专业版年付"，定价 ¥799/年
   - 保存后复制 API ID
5. 左侧菜单 **开发者** → **API密钥**
   - 复制 **可公布密钥**（`pk_live_...`）
   - 复制 **密钥**（`sk_live_...`）
   - 点击 **Webhook** → **添加端点**
   - 端点URL: `https://你的域名/api/stripe/webhook`
   - 事件选择: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
   - 创建后复制 **Signing secret**（`whsec_...`）

---

## 第二步：获取配置信息（5 分钟）

登录 Supabase 后台：
1. 左侧 **Project Settings** → **API**
2. 复制以下三个值：
   - **Project URL** → 这就是 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → 这就是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → 这就是 `SUPABASE_SERVICE_ROLE_KEY`

---

## 第三步：部署到 Vercel（10 分钟）

### 方法一：直接上传代码（推荐零基础）

1. 打开 https://vercel.com/new
2. 点击 **Upload** 按钮
3. 将整个项目文件夹拖拽上去
4. 在 Environment Variables 页面，填入以下所有环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase匿名key
SUPABASE_SERVICE_ROLE_KEY=你的supabase服务角色key
DEEPSEEK_API_KEY=你的deepseek api key
DEEPSEEK_BASE_URL=https://api.deepseek.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=你的stripe可公布key
STRIPE_SECRET_KEY=你的stripe密钥
STRIPE_WEBHOOK_SECRET=你的webhook secret
STRIPE_PRICE_MONTHLY=你的月付price_id
STRIPE_PRICE_YEARLY=你的年付price_id
NEXT_PUBLIC_APP_URL=https://你的域名.vercel.app
```

5. 点击 **Deploy**
6. 等待 2-3 分钟部署完成
7. 部署完成后，Vercel 会给你一个域名（`your-project.vercel.app`）

### 方法二：用 GitHub（推荐长期维护）

1. 把代码上传到 GitHub：
```bash
# 在项目目录执行
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

2. 打开 https://vercel.com/new
3. 选择你的 GitHub 仓库
4. 填入环境变量（同上）
5. 点击 Deploy

---

## 第四步：配置域名（可选，但推荐）

1. 在阿里云/腾讯云买域名（.xyz 首年约 ¥10-20）
2. 在 Vercel 项目设置 → **Domains** → 输入你的域名
3. 按照提示在域名管理后台添加 CNAME 解析
4. 等待 DNS 生效（通常几分钟到几小时）

---

## 第五步：更新 Stripe Webhook

部署完成后，你的域名就是 `https://你的项目.vercel.app`

1. 打开 Stripe 后台 → **开发者** → **Webhook**
2. 编辑刚才创建的 Webhook
3. 把 URL 改成：`https://你的项目.vercel.app/api/stripe/webhook`
4. 保存

---

## 常见问题

### Q: 部署后访问报错 500？
A: 大部分原因是环境变量没配对。检查：
- Supabase 的 URL 和 key 是否正确
- DeepSeek API key 是否有效
- 确认 `.env.local` 里的 `NEXT_PUBLIC_APP_URL` 填的是 Vercel 给你的域名

### Q: 注册后无法登录？
A: 检查 Supabase 后台：
1. 左侧 **Authentication** → **Settings**
2. 确保 **Enable email confirmations** 是关闭状态（测试期间）
3. 或者在 **Providers** 中开启 Google OAuth

### Q: AI 分析没反应？
A: 检查 DeepSeek API key 是否有余额：
- 登录 platform.deepseek.com
- 左侧 **Usage** 查看余额
- 如果余额为 0，点击 **Top up** 充值（最低 ¥10）

### Q: 支付无法使用？
A: Stripe 在中国大陆有特殊限制：
- 测试阶段用 Stripe 的测试模式（Dashboard 左侧关闭 "Viewing test data" 开关）
- 正式上线需要用 Stripe 的香港/新加坡账号，或者用 Lemon Squeezy

---

## 本地开发（可选）

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env.local
# 编辑 .env.local 填入真实值

# 3. 启动
npm run dev
# 浏览器打开 http://localhost:3000
```

---

## 技术栈

| 技术 | 用途 | 费用 |
|------|------|------|
| Next.js 14 | 前端 + 后端框架 | 免费 |
| Vercel | 网站托管 | 免费（Hobby 计划） |
| Supabase | 数据库 + 用户认证 | 免费（500MB） |
| DeepSeek | AI 文本分析 | 按量付费（¥10 用很久） |
| Stripe | 支付处理 | 免费接入，抽 2.9% |
| Tailwind CSS | UI 样式 | 免费 |

---

> **遇到问题？** 直接问我就行，我帮你排查。
