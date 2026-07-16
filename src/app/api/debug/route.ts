import { NextResponse } from 'next/server'

export async function GET() {
  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? '✅ 已设置' : '❌ 未设置',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ 未设置',
  }

  const urlPreview = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 40) + '...'
    : '无'

  return NextResponse.json({
    status: 'ok',
    env: vars,
    supabase_url_preview: urlPreview,
    node_env: process.env.NODE_ENV,
  })
}
