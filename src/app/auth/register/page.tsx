'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Store } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }
    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // 如果不需要邮箱验证，直接跳转
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-white mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI电商运营助手</h1>
          <p className="text-gray-500 mt-1">创建你的免费账号</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>注册</CardTitle>
            <CardDescription>注册后立即开始7天免费试用</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && <Alert variant="error">{error}</Alert>}

              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input id="name" placeholder="你的名字" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="至少6位" value={password}
                  onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>

              <Button type="submit" loading={loading} className="w-full">
                {loading ? '注册中...' : '免费注册'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
              已有账号？{' '}
              <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium">
                登录
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-xs text-gray-400 text-center mt-4">
          注册即表示同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  )
}
