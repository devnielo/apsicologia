import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'oklch(98% 0 0)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(21% 0 0)' },
  ],
}