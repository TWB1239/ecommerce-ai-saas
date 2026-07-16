'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('密码至少需要6位'); return }
    setLoading(true); setError('')

    const result = await signUp(email, password, name || undefined)

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    // 注册成功后直接跳转（Supabase 默认自动登录注册用户）
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl font-bold mb-4 shadow-lg shadow-purple-600/20">
            AI
          </div>
          <h1 className="text-2xl font-bold text-gray-900">创建账号</h1>
          <p className="text-gray-500 text-sm mt-1">注册即送 7 天专业版免费试用</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>称呼（选填）</Label>
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
                {loading ? '注册中...' : '免费注册'}
              </Button>
            </form>

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

        <p className="text-center text-xs text-gray-400 mt-6">注册即表示同意 服务条款 和 隐私政策</p>
      </div>
    </div>
  )
}
