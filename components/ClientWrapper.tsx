'use client';

import { Suspense, ReactNode } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientWrapper({ 
  children, 
  fallback = <div className="min-h-screen flex items-center justify-center">
               <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
             </div>
}: ClientWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
} 