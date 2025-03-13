'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FiAlertCircle } from 'react-icons/fi'

// Component for 404 content
function NotFoundContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <FiAlertCircle className="mx-auto mb-6 text-5xl text-red-400" />
          <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
          <p className="text-xl text-secondary mb-8">
            Запрашиваемая страница не существует или была перемещена.
          </p>
          <Link href="/" className="btn-primary">
            Вернуться на главную
          </Link>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  )
}

// Main component with Suspense boundary
export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  )
} 