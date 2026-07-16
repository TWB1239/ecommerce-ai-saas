'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('请输入邮箱和密码'); return }
    setLoading(true)
    setError('')

    const result = await signIn(email, password)

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl font-bold mb-4 shadow-lg shadow-purple-600/20">
            AI
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI电商运营助手</h1>
          <p className="text-gray-500 text-sm mt-1">登录你的账号，开始 AI 电商之旅</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleLogin} className="space-y-4">
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

        <p className="text-center text-xs text-gray-400 mt-6">登录即表示同意 服务条款 和 隐私政策</p>
      </div>
    </div>
  )
}
