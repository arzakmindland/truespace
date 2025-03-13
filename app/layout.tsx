import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Analytics } from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'TrueSpace - Образовательная платформа',
  description: 'Современная образовательная платформа с видео-уроками и интерактивными курсами',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
} 