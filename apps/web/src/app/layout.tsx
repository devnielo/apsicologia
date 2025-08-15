import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'apsicologia - Gestión de Consulta Psicológica',
    template: '%s | apsicologia',
  },
  description: 'Plataforma completa de gestión para centros de psicología',
  keywords: [
    'psicología',
    'consulta',
    'gestión',
    'citas',
    'pacientes',
    'profesionales',
    'salud mental'
  ],
  authors: [
    {
      name: 'apsicologia Team',
      url: 'https://arribapsicologia.com',
    },
  ],
  creator: 'apsicologia',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'oklch(98% 0 0)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(21% 0 0)' },
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://arribapsicologia.com',
    title: 'apsicologia - Gestión de Consulta Psicológica',
    description: 'Plataforma completa de gestión para centros de psicología',
    siteName: 'apsicologia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'apsicologia - Gestión de Consulta Psicológica',
    description: 'Plataforma completa de gestión para centros de psicología',
    creator: '@apsicologia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
