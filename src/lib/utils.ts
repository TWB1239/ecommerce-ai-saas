import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('zh-CN')}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function getPlatformLabel(platform: string): string {
  const map: Record<string, string> = {
    taobao: '淘宝',
    pinduoduo: '拼多多',
    jd: '京东',
    shopify: 'Shopify',
    other: '其他',
  }
  return map[platform] || platform
}

export function getTrialDaysLeft(trialEnd: string | null): number {
  if (!trialEnd) return 0
  const diff = new Date(trialEnd).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
