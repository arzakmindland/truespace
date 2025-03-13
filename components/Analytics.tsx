'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Suspense } from 'react'

// Component that uses useSearchParams
function AnalyticsContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Path change analytics tracking
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    
    // This is where you would integrate a real analytics service
    // For example: Google Analytics, Plausible, or custom solution
    console.log(`Page view: ${url}`)
    
    // Example of potential analytics call:
    // trackPageView({ url, title: document.title })
  }, [pathname, searchParams])
  
  return null
}

// Main component with Suspense boundary
export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  )
} 