'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-white/[0.15] bg-white/[0.05] px-3 py-2 text-sm text-white/90',
          'placeholder:text-zinc-500',
          'hover:border-white/[0.25] hover:bg-white/[0.07]',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 focus:shadow-[0_0_16px_rgba(168,85,247,0.20)]',
          'transition-all duration-200',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
export { Input }
