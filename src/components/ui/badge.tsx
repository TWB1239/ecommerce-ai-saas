'use client'

import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-gray-100 text-gray-800',
  secondary: 'bg-gray-500 text-white',
  outline: 'border border-gray-300 text-gray-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
} as const

interface BadgeProps {
  variant?: keyof typeof variants
  className?: string
  children: React.ReactNode
}

function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

export { Badge, type BadgeProps }
