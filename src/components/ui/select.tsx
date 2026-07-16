'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative group">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-white/[0.15] bg-white/[0.05] px-3 py-2 text-sm text-white/90 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 focus:shadow-[0_0_16px_rgba(168,85,247,0.20)]',
            'hover:border-white/[0.25] hover:bg-white/[0.07]',
            'transition-all duration-200',
            'disabled:cursor-not-allowed disabled:opacity-50 pr-10',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" className="bg-zinc-800 text-zinc-400">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-800 text-white/90">{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none transition-colors duration-200 group-hover:text-zinc-300" />
      </div>
    )
  }
)
Select.displayName = 'Select'
export { Select, type SelectProps }
