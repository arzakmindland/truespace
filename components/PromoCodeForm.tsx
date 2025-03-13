'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { FiLock, FiUnlock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import axios from 'axios'

interface PromoCodeFormProps {
  courseId?: string
  lessonId?: string
  onSuccess: () => void
}

export default function PromoCodeForm({ courseId, lessonId, onSuccess }: PromoCodeFormProps) {
  const { data: session } = useSession()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim()) {
      setError('Пожалуйста, введите промокод')
      return
    }
    
    if (!session) {
      setError('Для использования промокода необходимо войти в аккаунт')
      return
    }
    
    setError('')
    setIsLoading(true)
    
    try {
      const response = await axios.post('/api/promocodes/verify', {
        code: code.trim(),
        courseId,
        lessonId,
      })
      
      if (response.data.success) {
        setSuccess(true)
        // Call the success callback after 1.5 seconds
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Произошла ошибка при проверке промокода')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="bg-background-lighter rounded-lg shadow-lg p-8 max-w-md w-full mx-auto">
      <div className="flex flex-col items-center justify-center mb-6">
        {success ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full bg-green-900/20 flex items-center justify-center text-green-400 mb-4"
          >
            <FiUnlock className="w-8 h-8" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full bg-purple-900/20 flex items-center justify-center text-accent mb-4"
          >
            <FiLock className="w-8 h-8" />
          </motion.div>
        )}
        
        <h2 className="text-2xl font-bold text-center mb-1">
          {success ? 'Доступ открыт!' : 'Требуется промокод'}
        </h2>
        <p className="text-secondary text-center">
          {success 
            ? 'Промокод успешно применен' 
            : 'Для доступа к этому контенту введите действующий промокод'}
        </p>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center text-red-400"
          >
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-md flex items-center text-green-400"
          >
            <FiCheckCircle className="mr-2 flex-shrink-0" />
            <span>Промокод успешно применен! Загрузка контента...</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="promo-code" className="block text-sm font-medium mb-2">
              Промокод
            </label>
            <input
              id="promo-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input uppercase text-center text-lg tracking-widest"
              placeholder="ВВЕДИТЕ КОД"
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="btn-primary w-full flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Применить промокод'
            )}
          </button>
        </form>
      )}
      
      {!session && (
        <div className="mt-6 text-center text-sm text-secondary">
          <p>Для использования промокода необходимо <a href="/auth/login" className="text-accent hover:text-accent-light">войти в аккаунт</a></p>
        </div>
      )}
    </div>
  )
} 