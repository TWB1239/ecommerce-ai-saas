'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

type LoginMethod = 'wechat' | 'phone' | 'email'

export default function LoginPage() {
  const router = useRouter()
  const [method, setMethod] = useState<LoginMethod>('wechat')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  /** 邮箱密码登录 */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message === 'Invalid login credentials' ? '邮箱或密码错误' : signInError.message)
        return
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError('登录失败: ' + (err?.message || err?.toString() || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  /** 发送手机验证码 */
  const sendCode = async () => {
    if (!phone || phone.length < 11) { setError('请输入正确的手机号'); return }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) { setError(error.message); return }
      setCodeSent(true)
      setCountdown(60)
      const timer = setInterval(() => setCountdown((c) => { if (c <= 1) clearInterval(timer); return c - 1 }), 1000)
    } catch (err: any) {
      setError('发送失败: ' + (err?.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  /** 手机验证码登录 */
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) { setError('请输入验证码'); return }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' })
      if (error) { setError(error.message); return }
      router.push('/dashboard')
    } catch (err: any) {
      setError('验证失败: ' + (err?.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  /** 微信登录（占位，需配置） */
  const handleWeChatLogin = () => {
    setError('微信登录需要在 微信开放平台 注册后才能使用（¥300/年），暂时先用手机或邮箱登录吧')
  }

  const tabs: { key: LoginMethod; label: string; icon: string }[] = [
    { key: 'wechat', label: '微信登录', icon: '💬' },
    { key: 'phone', label: '手机登录', icon: '📱' },
    { key: 'email', label: '邮箱登录', icon: '✉️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl font-bold mb-4 shadow-lg shadow-purple-600/20">
            AI
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI电商运营助手</h1>
          <p className="text-gray-500 text-sm mt-1">登录你的账号，开始 AI 电商之旅</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {/* 登录方式切换 */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setMethod(tab.key); setError('') }}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                    method === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            {/* 微信登录 */}
            {method === 'wechat' && (
              <div className="py-4">
                <button
                  onClick={handleWeChatLogin}
                  className="w-full py-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                    💬
                  </div>
                  <span className="text-gray-700 font-medium">微信扫码登录</span>
                  <span className="text-gray-400 text-xs mt-1">安全 · 快捷 · 免注册</span>
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  💡 需配置微信开放平台后才能使用，暂时先用其他方式登录
                </p>
              </div>
            )}

            {/* 手机验证码登录 */}
            {method === 'phone' && (
              <form onSubmit={codeSent ? handlePhoneLogin : sendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label>手机号</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="tel" placeholder="请输入手机号"
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                        maxLength={11} disabled={codeSent}
                      />
                    </div>
                    {!codeSent ? (
                      <Button type="submit" variant="outline" loading={loading} className="shrink-0">
                        获取验证码
                      </Button>
                    ) : (
                      <Button type="button" variant="ghost" disabled className="shrink-0 text-xs" onClick={() => {}}>
                        {countdown > 0 ? `${countdown}s` : '重新发送'}
                      </Button>
                    )}
                  </div>
                </div>

                {codeSent && (
                  <div className="space-y-2">
                    <Label>验证码</Label>
                    <Input
                      type="text" placeholder="输入 6 位验证码"
                      value={code} onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                )}

                {codeSent && (
                  <Button type="submit" className="w-full" loading={loading}>
                    登录
                  </Button>
                )}

                <p className="text-xs text-gray-400 text-center">
                  未注册的手机号验证后自动创建账号
                </p>
              </form>
            )}

            {/* 邮箱密码登录 */}
            {method === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>邮箱</Label>
                  <Input type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>密码</Label>
                  <Input type="password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            )}

            {/* 注册入口 */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                还没有账号？{' '}
                <Link href="/auth/register" className="text-purple-600 hover:text-purple-700 font-medium">
                  立即注册
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 底部说明 */}
        <p className="text-center text-xs text-gray-400 mt-6">
          登录即表示同意 服务条款 和 隐私政策
        </p>
      </div>
    </div>
  )
}
