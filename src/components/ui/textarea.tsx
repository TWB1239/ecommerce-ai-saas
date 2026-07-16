'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-white/[0.08] focus:ring-purple-500/30 focus:border-purple-500/50',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
export { Textarea, type TextareaProps }
