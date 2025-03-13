'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactNode, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </QueryClientProvider>
    </SessionProvider>
  )
} 