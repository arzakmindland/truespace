'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'

type LoginFormValues = {
  email: string
  password: string
}

// Component that uses useSearchParams
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>()
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      })
      
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      
      router.push(callbackUrl)
    } catch (error) {
      setError('Произошла ошибка при входе')
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              TrueSpace
            </h1>
          </Link>
          <p className="mt-2 text-secondary">Войдите в ваш аккаунт</p>
        </div>
        
        <div className="bg-background-lighter shadow-subtle rounded-lg p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center text-red-400"
            >
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                  {...register('email', {
                    required: 'Email обязателен',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Неверный формат email',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Пароль обязателен',
                    minLength: {
                      value: 6,
                      message: 'Пароль должен содержать минимум 6 символов',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-background-light border-gray-700 rounded text-accent focus:ring-accent"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary">
                  Запомнить меня
                </label>
              </div>
              
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-accent hover:text-accent-light transition-colors"
                >
                  Забыли пароль?
                </Link>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Войти'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Нет аккаунта?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-accent hover:text-accent-light transition-colors"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 