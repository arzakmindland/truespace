'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FiSave,
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiPlus,
  FiTrash2,
  FiX
} from 'react-icons/fi'

interface CourseFormValues {
  title: string
  slug: string
  description: string
  thumbnail: string
  category: string
  tags: string[]
  requirements: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  published: boolean
  featured: boolean
}

export default function NewCoursePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [requirementInput, setRequirementInput] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CourseFormValues>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      thumbnail: 'https://via.placeholder.com/1280x720?text=Course+Thumbnail',
      category: 'programming',
      tags: [],
      requirements: [],
      level: 'beginner',
      duration: 0,
      published: false,
      featured: false
    }
  })
  
  const watchedTags = watch('tags')
  const watchedRequirements = watch('requirements')
  const watchedTitle = watch('title')
  
  // Update slug when title changes
  useEffect(() => {
    if (watchedTitle) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
      
      setValue('slug', slug)
    }
  }, [watchedTitle, setValue])
  
  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/login?callbackUrl=/admin')
    }
  }, [session, status, router])
  
  // Handle tag input
  const addTag = () => {
    if (!tagInput.trim()) return
    
    if (!watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()])
    }
    
    setTagInput('')
  }
  
  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
  }
  
  // Handle requirement input
  const addRequirement = () => {
    if (!requirementInput.trim()) return
    
    if (!watchedRequirements.includes(requirementInput.trim())) {
      setValue('requirements', [...watchedRequirements, requirementInput.trim()])
    }
    
    setRequirementInput('')
  }
  
  const removeRequirement = (reqToRemove: string) => {
    setValue('requirements', watchedRequirements.filter(req => req !== reqToRemove))
  }
  
  // Submit form
  const onSubmit = async (data: CourseFormValues) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await axios.post('/api/courses', data)
      
      if (response.data.success) {
        setSuccess(true)
        reset()
        
        // Redirect to course page after successful creation
        setTimeout(() => {
          router.push(`/admin/courses/${response.data.course._id}`)
        }, 2000)
      }
    } catch (error: any) {
      console.error('Error creating course:', error)
      
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Произошла ошибка при создании курса')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  // Unauthorized state
  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background p-4">
        <div className="text-center max-w-md p-6 bg-background-lighter rounded-lg shadow-md">
          <FiAlertCircle className="mx-auto text-red-500 text-4xl mb-4" />
          <h1 className="text-xl font-semibold mb-3">Доступ запрещен</h1>
          <p className="text-gray-400 mb-4">У вас нет прав для доступа к этой странице. Требуется роль администратора.</p>
          <Link href="/auth/login" className="btn-primary inline-block">
            Войти с другим аккаунтом
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin" className="p-2 rounded-full hover:bg-gray-800 mr-2">
              <FiArrowLeft />
            </Link>
            <h1 className="text-2xl font-bold">Создание нового курса</h1>
          </div>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center text-red-400"
          >
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-md flex items-center text-green-400"
          >
            <FiCheckCircle className="mr-2 flex-shrink-0" />
            <span>Курс успешно создан! Перенаправление...</span>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-background-lighter p-6 rounded-lg shadow-subtle">
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Название курса*
                </label>
                <input
                  id="title"
                  type="text"
                  className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Введите название курса"
                  {...register('title', { required: 'Название курса обязательно' })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-2">
                  Slug (URL)*
                </label>
                <input
                  id="slug"
                  type="text"
                  className={`input w-full ${errors.slug ? 'border-red-500' : ''}`}
                  placeholder="unique-course-url"
                  {...register('slug', { required: 'Slug курса обязателен' })}
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>
                )}
              </div>
            </div>
            
            {/* Описание */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Описание курса*
              </label>
              <textarea
                id="description"
                rows={5}
                className={`input w-full ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Подробное описание курса..."
                {...register('description', { required: 'Описание курса обязательно' })}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>
            
            {/* Миниатюра */}
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium mb-2">
                URL миниатюры курса*
              </label>
              <div className="flex items-start space-x-4">
                <div className="flex-grow">
                  <input
                    id="thumbnail"
                    type="text"
                    className={`input w-full ${errors.thumbnail ? 'border-red-500' : ''}`}
                    placeholder="https://example.com/image.jpg"
                    {...register('thumbnail', {
                      required: 'URL миниатюры обязателен',
                      pattern: {
                        value: /^(https?:\/\/)?.+/i,
                        message: 'Введите корректный URL'
                      }
                    })}
                  />
                  {errors.thumbnail && (
                    <p className="mt-1 text-sm text-red-400">{errors.thumbnail.message}</p>
                  )}
                </div>
                <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md border border-gray-700">
                  <img
                    src={watch('thumbnail')}
                    alt="Предпросмотр"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/240x240?text=Error'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Категория и уровень */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Категория*
                </label>
                <select
                  id="category"
                  className="input w-full"
                  {...register('category', { required: 'Категория обязательна' })}
                >
                  <option value="programming">Программирование</option>
                  <option value="design">Дизайн</option>
                  <option value="business">Бизнес</option>
                  <option value="marketing">Маркетинг</option>
                  <option value="personal-development">Личностное развитие</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium mb-2">
                  Уровень сложности*
                </label>
                <select
                  id="level"
                  className="input w-full"
                  {...register('level', { required: 'Уровень сложности обязателен' })}
                >
                  <option value="beginner">Начинающий</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>
            </div>
            
            {/* Теги */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Теги курса
              </label>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  className="input flex-grow"
                  placeholder="Добавить тег"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary ml-2"
                  onClick={addTag}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedTags.map((tag) => (
                  <div 
                    key={tag} 
                    className="px-3 py-1 bg-accent/20 text-accent rounded-full flex items-center text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="ml-2 text-accent hover:text-white"
                      onClick={() => removeTag(tag)}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                {watchedTags.length === 0 && (
                  <p className="text-sm text-secondary">Нет добавленных тегов</p>
                )}
              </div>
            </div>
            
            {/* Требования */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Требования к курсу
              </label>
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  className="input flex-grow"
                  placeholder="Добавить требование"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRequirement()
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary ml-2"
                  onClick={addRequirement}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="space-y-2 mt-2">
                {watchedRequirements.map((req, index) => (
                  <div 
                    key={index}
                    className="px-3 py-2 bg-gray-800 rounded-md flex items-center justify-between text-sm"
                  >
                    <span>{req}</span>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => removeRequirement(req)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
                {watchedRequirements.length === 0 && (
                  <p className="text-sm text-secondary">Нет добавленных требований</p>
                )}
              </div>
            </div>
            
            {/* Длительность */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-2">
                Длительность курса (в минутах)
              </label>
              <input
                id="duration"
                type="number"
                className="input w-full"
                min="0"
                placeholder="0"
                {...register('duration', { valueAsNumber: true })}
              />
            </div>
            
            {/* Настройки публикации */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center">
                <input
                  id="published"
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 focus:ring-accent"
                  {...register('published')}
                />
                <label htmlFor="published" className="ml-2 text-sm font-medium">
                  Опубликовать курс
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="featured"
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 focus:ring-accent"
                  {...register('featured')}
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium">
                  Рекомендуемый курс
                </label>
              </div>
            </div>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex justify-end space-x-4 mt-8">
            <Link href="/admin" className="btn-secondary flex items-center">
              <FiX className="mr-2" /> Отмена
            </Link>
            <button
              type="submit"
              disabled={isLoading || success}
              className="btn-primary flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Создание...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Создать курс
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 