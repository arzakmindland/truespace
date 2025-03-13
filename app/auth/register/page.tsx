'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import axios from 'axios'

type RegisterFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>()
  
  const password = watch('password')
  
  const onSubmit = async (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })
      
      if (response.data.success) {
        setSuccess(true)
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Произошла ошибка при регистрации')
      }
    } finally {
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
          <p className="mt-2 text-secondary">Создайте ваш аккаунт</p>
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
          
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-md flex items-center text-green-400"
            >
              <FiCheckCircle className="mr-2 flex-shrink-0" />
              <span>Регистрация успешна! Перенаправление на страницу входа...</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Имя
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ваше имя"
                  {...register('name', {
                    required: 'Имя обязательно',
                    minLength: {
                      value: 2,
                      message: 'Имя должно содержать минимум 2 символа',
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>
            
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
                  autoComplete="new-password"
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
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Подтверждение пароля
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Подтверждение пароля обязательно',
                    validate: (value) => 
                      value === password || 'Пароли не совпадают',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading || success}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Зарегистрироваться'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Уже есть аккаунт?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-accent hover:text-accent-light transition-colors"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 