'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/header'

// ===== 动画组件 =====

/** 数字滚动动画 */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const steps = 60
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setDisplay(value)
              clearInterval(timer)
            } else {
              setDisplay(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className="text-4xl font-bold text-white md:text-5xl">
      {display.toLocaleString()}{suffix}
    </span>
  )
}

/** 滚动入场动画 — 从底部淡入上滑 */
function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

/** 浮动粒子背景 */
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
      })
    }

    let animId: number
    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas!.width
        if (p.x > canvas!.width) p.x = 0
        if (p.y < 0) p.y = canvas!.height
        if (p.y > canvas!.height) p.y = 0
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(168, 85, 247, ${p.alpha})`
        ctx!.fill()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
}

// ===== 数据 =====

const features = [
  {
    icon: '🔍',
    title: '店铺诊断',
    desc: 'AI 智能分析你的店铺数据，自动发现流量、转化、客单价问题，给出可执行的优化方案。',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: '✏️',
    title: '标题优化',
    desc: '3 秒生成高点击率商品标题，精准匹配热搜关键词，大幅提升搜索排名和曝光量。',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '📊',
    title: '竞品对比分析',
    desc: '一键对比竞品定价、卖点、评价，AI 自动找出你的差异化优势和竞争机会。',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: '💬',
    title: '评价分析助手',
    desc: '系统分析好评卖点与差评规律，帮你快速改进产品和服务，减少差评提升转化。',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '🎙️',
    title: '直播话术',
    desc: '基于产品特点和目标人群，AI 自动生成完整的直播带货脚本，拿来就能用。',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    icon: '📈',
    title: '营业额分析',
    desc: '深度分析每日经营数据，发现增长趋势，精准定位问题和机会，驱动业绩增长。',
    gradient: 'from-green-500 to-emerald-500',
  },
]

const stats = [
  { value: 1280, suffix: '+', label: '活跃用户' },
  { value: 85600, suffix: '+', label: '分析次数' },
  { value: 98, suffix: '%', label: '用户满意度' },
  { value: 3, suffix: 'x', label: '平均效率提升' },
]

const plans = [
  {
    name: '免费版',
    price: '¥0',
    period: '/月',
    badge: '7 天试用',
    desc: '适合个人卖家入门体验',
    features: ['7 天专业版免费试用', '每日 10 次诊断分析', '基础标题优化', '基础直播话术', '社区支持'],
    cta: '免费使用',
    highlighted: false,
  },
  {
    name: '专业版',
    price: '¥99',
    period: '/月',
    badge: '最受欢迎',
    desc: '适合专业电商卖家',
    features: ['每日 100 次分析', '全部 6 大功能', '竞品对比分析', '评价分析助手', '高级标题优化', '营业额分析', '历史记录保存', '优先客服'],
    cta: '立即订阅',
    highlighted: true,
  },
  {
    name: '专业版·年付',
    price: '¥1,089',
    period: '/年',
    badge: '省 ¥99',
    desc: '相当于 ¥90.75/月',
    features: ['不限次数分析', '全部 6 大功能', '竞品对比分析', '评价分析助手', '高级标题优化', '营业额分析', '无限历史记录', '优先客服', '新功能抢先体验'],
    cta: '订阅年付',
    highlighted: false,
    save: true,
  },
]

// ===== 主页面 =====

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,80,255,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <FadeInSection delay={0}>
            <div className="mb-6 inline-flex animate-pulse items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400">
              🚀 AI 驱动电商增长新方式
            </div>
          </FadeInSection>
          <FadeInSection delay={150}>
            <h1 className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              用AI驱动你的
              <br />
              电商增长
            </h1>
          </FadeInSection>
          <FadeInSection delay={300}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              店铺诊断 · 标题优化 · 竞品对比 · 评价分析 · 直播话术 · 营业额分析
              <br />
              <span className="text-purple-400">六大 AI 功能，让你的电商运营效率提升 3 倍</span>
            </p>
          </FadeInSection>
          <FadeInSection delay={450}>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="group relative rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-700 hover:shadow-purple-600/40"
              >
                <span className="relative z-10">免费试用 7 天</span>
              </Link>
              <Link
                href="#features"
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-8 py-3.5 text-base font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
              >
                了解更多
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ 功能展示 ═══ */}
      <FadeInSection>
        <section id="features" className="relative overflow-hidden border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">六大 AI 功能，覆盖运营全链路</h2>
              <p className="mt-4 text-lg text-zinc-400">从发现问题到执行优化，AI 帮你一站式搞定</p>
            </div>

            {/* 运营闭环流程图 */}
            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-sm">
              {['店铺诊断', '竞品对比', '评价分析', '标题优化', '直播话术', '营业额分析'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-600/20 px-3 py-1 text-purple-300">{step}</span>
                  {i < 5 && <span className="text-zinc-600">→</span>}
                </div>
              ))}
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <FadeInSection key={feature.title} delay={i * 100}>
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10">
                    {/* 顶部彩色渐变条 */}
                    <div className={`absolute right-0 top-0 h-1 w-full bg-gradient-to-r ${feature.gradient} opacity-60 transition-all duration-300 group-hover:opacity-100`} />
                    
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-2xl shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.desc}</p>
                    
                    {/* 悬浮时显示的装饰光晕 */}
                    <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══ 工作流程 ═══ */}
      <FadeInSection>
        <section className="relative overflow-hidden border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,80,255,0.08),transparent_60%)]" />
          <div className="relative mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">运营也可以很简单</h2>
              <p className="mt-4 text-lg text-zinc-400">四个步骤，形成增长飞轮</p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-4">
              {[
                { step: '01', title: '诊断问题', desc: 'AI 分析你的店铺数据，精准定位问题所在', icon: '🔍' },
                { step: '02', title: '分析内外', desc: '看客户评价、看竞品策略，找到优化方向', icon: '📊' },
                { step: '03', title: '执行优化', desc: 'AI 生成优化标题、直播话术，马上能用', icon: '⚡' },
                { step: '04', title: '验证效果', desc: '分析营业额变化，验证改进效果，持续迭代', icon: '📈' },
              ].map((item, i) => (
                <FadeInSection key={item.step} delay={i * 150}>
                  <div className="relative text-center">
                    {/* 连接线 */}
                    {i < 3 && <div className="absolute -right-4 top-12 hidden text-2xl text-zinc-700 md:block">→</div>}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-2xl shadow-lg shadow-purple-600/20">
                      {item.icon}
                    </div>
                    <div className="mt-4 text-sm font-bold text-purple-400">{item.step}</div>
                    <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══ 数据展示（交互动画） ═══ */}
      <section className="relative overflow-hidden border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10" />
        <div className="relative mx-auto max-w-7xl">
          <FadeInSection>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">用数据说话</h2>
              <p className="mt-4 text-lg text-zinc-400">中小卖家正在用 AI 改变运营方式</p>
            </div>
          </FadeInSection>
          <div className="mt-16 grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <FadeInSection key={stat.label} delay={i * 150}>
                <div className="group rounded-2xl border border-white/10 bg-zinc-900/30 p-8 transition-all duration-300 hover:border-purple-500/30 hover:bg-zinc-900/50">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  <p className="mt-2 text-zinc-400">{stat.label}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 定价 ═══ */}
      <FadeInSection>
        <section id="pricing" className="relative overflow-hidden border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(120,80,255,0.1),transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">简单透明的定价</h2>
              <p className="mt-4 text-lg text-zinc-400">免费试用 7 天，满意再付费</p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`group relative rounded-2xl border p-8 transition-all duration-300 ${
                    plan.highlighted
                      ? 'scale-105 border-purple-500 bg-purple-600/10 shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30'
                      : plan.save
                        ? 'border-emerald-500/30 bg-zinc-900/70 hover:border-emerald-500/50'
                        : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                  }`}
                >
                  {/* Badge */}
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-medium text-white ${
                      plan.highlighted
                        ? 'bg-purple-600'
                        : plan.save
                          ? 'bg-emerald-600'
                          : 'bg-zinc-600'
                    }`}
                  >
                    {plan.badge}
                  </div>

                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{plan.desc}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-500">{plan.period}</span>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-zinc-300">
                        <svg className="h-4 w-4 flex-shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/register"
                    className={`mt-8 flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40'
                        : plan.save
                          ? 'border border-emerald-600/50 text-emerald-300 hover:bg-emerald-600/10'
                          : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            {/* 节省提示 */}
            <div className="mt-8 text-center">
              <p className="text-sm text-zinc-500">
                年付相比月付省 ¥99 · 所有套餐均含 7 天免费试用 · 随时取消
              </p>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ═══ 底部 CTA ═══ */}
      <section className="relative overflow-hidden border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-black to-blue-900/20" />
        <div className="relative mx-auto max-w-3xl text-center">
          <FadeInSection>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">立即开始你的 AI 电商之旅</h2>
            <p className="mt-4 text-lg text-zinc-400">免费试用 7 天，无需信用卡</p>
            <Link
              href="/auth/register"
              className="mt-8 inline-flex animate-pulse items-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:shadow-purple-600/40"
            >
              免费注册 →
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">AI</div>
                <span className="font-semibold text-white">AI电商运营助手</span>
              </div>
              <p className="mt-3 text-sm text-zinc-500">用 AI 驱动电商增长，让运营更高效。</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">功能</h4>
              <ul className="mt-4 space-y-2">
                {['店铺诊断', '标题优化', '竞品对比', '评价分析', '直播话术', '营业额分析'].map((f) => (
                  <li key={f}><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{f}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">公司</h4>
              <ul className="mt-4 space-y-2">
                {['关于我们', '联系我们', '隐私政策', '服务条款'].map((f) => (
                  <li key={f}><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{f}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">支持</h4>
              <ul className="mt-4 space-y-2">
                {['帮助中心', 'API 文档', '状态页'].map((f) => (
                  <li key={f}><a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{f}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} AI电商运营助手. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
