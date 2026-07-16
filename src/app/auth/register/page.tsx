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

type RegMethod = 'phone' | 'email'

export default function RegisterPage() {
  const router = useRouter()
  const [method, setMethod] = useState<RegMethod>('phone')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  /** 邮箱注册 */
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('密码至少需要6位'); return }
    setLoading(true); setError('')
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } },
      })
      if (signUpError) { setError(signUpError.message); return }
      router.push('/dashboard')
    } catch (err: any) {
      setError('注册失败: ' + (err?.message || '未知错误'))
    } finally { setLoading(false) }
  }

  /** 发送手机验证码 */
  const sendCode = async () => {
    if (!phone || phone.length < 11) { setError('请输入正确的手机号'); return }
    setError(''); setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) { setError(error.message); return }
      setCodeSent(true); setCountdown(60)
      const timer = setInterval(() => setCountdown((c) => { if (c <= 1) clearInterval(timer); return c - 1 }), 1000)
    } catch (err: any) {
      setError('发送失败: ' + (err?.message || '未知错误'))
    } finally { setLoading(false) }
  }

  /** 手机号注册（验证码验证） */
  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) { setError('请输入验证码'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' })
      if (error) { setError(error.message); return }
      router.push('/dashboard')
    } catch (err: any) {
      setError('验证失败: ' + (err?.message || '未知错误'))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl font-bold mb-4 shadow-lg shadow-purple-600/20">
            AI
          </div>
          <h1 className="text-2xl font-bold text-gray-900">创建账号</h1>
          <p className="text-gray-500 text-sm mt-1">注册即送 7 天专业版免费试用</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {/* 方式切换 */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              <button
                onClick={() => { setMethod('phone'); setError('') }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  method === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📱 手机注册
              </button>
              <button
                onClick={() => { setMethod('email'); setError('') }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  method === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ✉️ 邮箱注册
              </button>
            </div>

            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            {/* 手机注册 */}
            {method === 'phone' && (
              <form onSubmit={codeSent ? handlePhoneRegister : sendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label>手机号</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input type="tel" placeholder="请输入手机号" value={phone}
                        onChange={(e) => setPhone(e.target.value)} maxLength={11} disabled={codeSent} />
                    </div>
                    {!codeSent ? (
                      <Button type="submit" variant="outline" loading={loading} className="shrink-0">
                        获取验证码
                      </Button>
                    ) : (
                      <Button type="button" variant="ghost" disabled className="shrink-0 text-xs"
                        onClick={() => {}}>
                        {countdown > 0 ? `${countdown}s` : '重新发送'}
                      </Button>
                    )}
                  </div>
                </div>
                {codeSent && (
                  <>
                    <div className="space-y-2">
                      <Label>验证码</Label>
                      <Input type="text" placeholder="输入 6 位验证码" value={code}
                        onChange={(e) => setCode(e.target.value)} maxLength={6} />
                    </div>
                    <Button type="submit" className="w-full" loading={loading}>
                      注册并登录
                    </Button>
                  </>
                )}
                <p className="text-xs text-gray-400 text-center">验证后自动创建账号，无需设置密码</p>
              </form>
            )}

            {/* 邮箱注册 */}
            {method === 'email' && (
              <form onSubmit={handleEmailRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label>称呼</Label>
                  <Input placeholder="你的名字或昵称" value={name}
                    onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>邮箱</Label>
                  <Input type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>密码</Label>
                  <Input type="password" placeholder="至少 6 位" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  注册
                </Button>
              </form>
            )}

            {/* 登录入口 */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                已有账号？{' '}
                <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-medium">
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          注册即表示同意 服务条款 和 隐私政策
        </p>
      </div>
    </div>
  )
}
