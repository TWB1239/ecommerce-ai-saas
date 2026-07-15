'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  text?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

function Loading({ text = '加载中...', className, size = 'md' }: LoadingProps) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-3', className)}>
      <Loader2 className={cn('animate-spin text-amber-500', sizeClasses[size])} />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}

function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading text="页面加载中..." size="lg" />
    </div>
  )
}

export { Loading, PageLoading }
