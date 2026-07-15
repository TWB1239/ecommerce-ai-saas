'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

const variants = {
  default: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
} as const

const icons = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
} as const

interface AlertProps {
  variant?: keyof typeof variants
  className?: string
  children: React.ReactNode
}

function Alert({ variant = 'default', className, children }: AlertProps) {
  const Icon = icons[variant]
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border p-4 text-sm', variants[variant], className)}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  )
}

export { Alert, type AlertProps }
