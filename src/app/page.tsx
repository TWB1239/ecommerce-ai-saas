'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/header'

// 动画数字组件
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

const features = [
  {
    icon: '🔍',
    title: '店铺诊断',
    desc: 'AI 智能分析你的店铺数据，发现问题并提供优化建议，提升转化率。',
  },
  {
    icon: '✏️',
    title: '标题优化',
    desc: '自动生成高点击率的商品标题，提高搜索排名和曝光量。',
  },
  {
    icon: '🎙️',
    title: '直播话术',
    desc: '基于产品特点和目标用户，智能生成直播带货话术脚本。',
  },
  {
    icon: '📈',
    title: '营业额分析',
    desc: '深度分析营收数据，发现增长机会，制定精准运营策略。',
  },
]

const stats = [
  { value: 1000, suffix: '+', label: '活跃用户' },
  { value: 50000, suffix: '+', label: '分析次数' },
  { value: 98, suffix: '%', label: '用户满意度' },
  { value: 3, suffix: 'x', label: '平均效率提升' },
]

const plans = [
  {
    name: '免费版',
    price: '¥0',
    period: '/月',
    desc: '适合个人卖家入门体验',
    features: ['每日10次诊断分析', '基础标题优化', '基础直播话术', '社区支持'],
    cta: '免费使用',
    highlighted: false,
  },
  {
    name: '专业版',
    price: '¥99',
    period: '/月',
    desc: '适合专业电商卖家',
    features: ['每日100次诊断分析', '高级标题优化', '高级直播话术', '营业额分析', '优先客服支持'],
    cta: '立即订阅',
    highlighted: true,
  },
  {
    name: '企业版',
    price: '¥299',
    period: '/月',
    desc: '适合电商团队和企业',
    features: ['不限次数分析', '全部高级功能', 'API 接入', '专属客户经理', '定制化方案'],
    cta: '联系销售',
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero 区域 */}
      <section className="relative overflow-hidden px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,80,255,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400">
            🚀 AI 驱动电商增长新方式
          </div>
          <h1 className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            用AI驱动你的
            <br />
            电商增长
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            智能诊断店铺问题、优化商品标题、生成直播话术、分析营业额数据
            <br />
            让你的电商运营效率提升 3 倍以上
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-700 hover:shadow-purple-600/40"
            >
              免费试用
            </Link>
            <Link
              href="#features"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-8 py-3.5 text-base font-semibold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* 功能展示区 */}
      <section id="features" className="border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              强大的 AI 功能
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              覆盖电商运营全场景，让每个决策都有数据支撑
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-6 transition-all hover:border-purple-500/30 hover:bg-zinc-900 hover:shadow-lg hover:shadow-purple-500/5"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 数据展示区 */}
      <section className="border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                <p className="mt-2 text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 定价简介 */}
      <section className="border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              简单透明的定价
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              选择适合你的方案，随时升级或降级
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all ${
                  plan.highlighted
                    ? 'border-purple-500 bg-purple-600/10 shadow-xl shadow-purple-500/10'
                    : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-xs font-medium text-white">
                    最受欢迎
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500">{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-zinc-300">
                      <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 hover:bg-purple-700'
                      : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 底部 */}
      <section className="border-t border-white/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            立即开始你的 AI 电商之旅
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            无需信用卡，免费体验所有功能
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-700 hover:shadow-purple-600/40"
          >
            免费注册 →
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
                  AI
                </div>
                <span className="font-semibold text-white">AI电商运营助手</span>
              </div>
              <p className="mt-3 text-sm text-zinc-500">
                用 AI 驱动电商增长，让运营更高效。
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">功能</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">店铺诊断</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">标题优化</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">直播话术</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">营业额分析</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">公司</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">关于我们</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">联系我们</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">隐私政策</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">服务条款</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">支持</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">帮助中心</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">API 文档</Link></li>
                <li><Link href="#" className="text-sm text-zinc-500 hover:text-zinc-300">状态页</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-zinc-600">
              &copy; {new Date().getFullYear()} AI电商运营助手. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
