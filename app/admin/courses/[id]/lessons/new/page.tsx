'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { motion } from 'framer-motion'
import { FiSave, FiYoutube, FiArrowLeft, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi'

interface NewLessonFormValues {
  title: string
  slug: string
  description: string
  youtubeId: string
  duration: number
  order: number
  requiresPromoCode: boolean
  resources: {
    title: string
    type: 'pdf' | 'link' | 'file'
    url: string
  }[]
  published: boolean
}

export default function NewLessonPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [course, setCourse] = useState<any>(null)
  const [youtubeData, setYoutubeData] = useState<any>(null)
  const [isLoadingYouTubeData, setIsLoadingYouTubeData] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<NewLessonFormValues>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      youtubeId: '',
      duration: 0,
      order: 1,
      requiresPromoCode: true,
      resources: [],
      published: false,
    },
  })
  
  const youtubeId = watch('youtubeId')
  const resources = watch('resources')
  
  // Check authentication and fetch course data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (status === 'loading') return
      
      if (!session || session.user.role !== 'admin') {
        router.push('/auth/login?callbackUrl=/admin')
        return
      }
      
      try {
        const response = await axios.get(`/api/courses/${params.id}`)
        setCourse(response.data.course)
        
        // Set default order to the next available order
        const nextOrder = response.data.course.lessons.length + 1
        setValue('order', nextOrder)
      } catch (error) {
        console.error('Error fetching course:', error)
        setError('Ошибка загрузки данных курса')
      }
    }
    
    checkAuthAndFetchData()
  }, [params.id, router, session, status, setValue])
  
  // Fetch YouTube video data
  const fetchYoutubeData = async () => {
    if (!youtubeId.trim()) return
    
    setIsLoadingYouTubeData(true)
    setYoutubeData(null)
    
    try {
      // На реальном проекте здесь должен быть запрос к YouTube API
      // Но для демонстрации просто имитируем получение данных
      setTimeout(() => {
        // Это заглушка, в реальном проекте здесь должен быть запрос к YouTube API
        const mockYouTubeData = {
          title: 'Демонстрационное видео YouTube',
          description: 'Описание демонстрационного видео. Здесь обычно отображается настоящее описание с YouTube.',
          duration: 360, // 6 минут в секундах
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
        }
        
        setYoutubeData(mockYouTubeData)
        
        // Префилл формы данными с YouTube
        setValue('title', mockYouTubeData.title)
        setValue('description', mockYouTubeData.description)
        setValue('duration', mockYouTubeData.duration)
        
        // Создать slug из заголовка
        const slugFromTitle = mockYouTubeData.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-')
        setValue('slug', slugFromTitle)
        
        setIsLoadingYouTubeData(false)
      }, 1500)
    } catch (error) {
      console.error('Error fetching YouTube data:', error)
      setError('Ошибка получения данных видео с YouTube')
      setIsLoadingYouTubeData(false)
    }
  }
  
  // Add a new resource field
  const addResource = () => {
    setValue('resources', [
      ...resources,
      { title: '', type: 'link', url: '' }
    ])
  }
  
  // Remove a resource field
  const removeResource = (index: number) => {
    const newResources = [...resources]
    newResources.splice(index, 1)
    setValue('resources', newResources)
  }
  
  // Form submission handler
  const onSubmit = async (data: NewLessonFormValues) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(`/api/courses/${params.id}/lessons`, data)
      
      if (response.data.success) {
        router.push(`/admin/courses/${params.id}`)
      }
    } catch (error: any) {
      console.error('Error creating lesson:', error)
      setError(error.response?.data?.message || 'Ошибка создания урока')
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!session || session.user.role !== 'admin') {
    return null // Редирект будет выполнен в useEffect
  }
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(`/admin/courses/${params.id}`)}
            className="flex items-center text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Назад к курсу
          </button>
          
          <h1 className="text-2xl font-bold">Новый урок</h1>
        </div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-md flex items-center"
          >
            <FiAlertCircle className="text-red-500 mr-3" />
            <span>{error}</span>
          </motion.div>
        )}
        
        <div className="bg-background-lighter p-6 rounded-lg shadow-subtle mb-8">
          <h2 className="text-xl font-semibold mb-4">Информация о видео с YouTube</h2>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="YouTube ID (например, dQw4w9WgXcQ)"
              className="input flex-grow"
              value={youtubeId}
              onChange={(e) => setValue('youtubeId', e.target.value)}
            />
            
            <button
              type="button"
              onClick={fetchYoutubeData}
              disabled={isLoadingYouTubeData || !youtubeId.trim()}
              className="btn-primary flex items-center"
            >
              {isLoadingYouTubeData ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FiYoutube className="mr-2" />
              )}
              Получить данные
            </button>
          </div>
          
          {youtubeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={youtubeData.thumbnail}
                  alt="Превью видео"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="md:col-span-2">
                <h3 className="font-medium">{youtubeData.title}</h3>
                <p className="text-secondary text-sm mt-2">{youtubeData.description.substring(0, 150)}...</p>
                <p className="text-sm mt-4">
                  Продолжительность: {Math.floor(youtubeData.duration / 60)} мин {youtubeData.duration % 60} сек
                </p>
              </div>
            </motion.div>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Название урока
              </label>
              <input
                id="title"
                type="text"
                className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
                {...register('title', { required: 'Название урока обязательно' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium mb-2">
                Slug (URL)
              </label>
              <input
                id="slug"
                type="text"
                className={`input w-full ${errors.slug ? 'border-red-500' : ''}`}
                {...register('slug', { required: 'Slug обязателен' })}
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Описание
            </label>
            <textarea
              id="description"
              rows={6}
              className={`input w-full ${errors.description ? 'border-red-500' : ''}`}
              {...register('description', { required: 'Описание обязательно' })}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium mb-2">
                Продолжительность (в секундах)
              </label>
              <input
                id="duration"
                type="number"
                min="0"
                className={`input w-full ${errors.duration ? 'border-red-500' : ''}`}
                {...register('duration', { required: 'Продолжительность обязательна', valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="order" className="block text-sm font-medium mb-2">
                Порядок в курсе
              </label>
              <input
                id="order"
                type="number"
                min="1"
                className={`input w-full ${errors.order ? 'border-red-500' : ''}`}
                {...register('order', { required: 'Порядок обязателен', valueAsNumber: true })}
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-500">{errors.order.message}</p>
              )}
            </div>
            
            <div className="flex flex-col justify-end mb-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    id="requiresPromoCode"
                    type="checkbox"
                    className="h-4 w-4 text-accent rounded border-gray-700 focus:ring-accent"
                    {...register('requiresPromoCode')}
                  />
                  <label htmlFor="requiresPromoCode" className="ml-2 block text-sm">
                    Требуется промокод
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="published"
                    type="checkbox"
                    className="h-4 w-4 text-accent rounded border-gray-700 focus:ring-accent"
                    {...register('published')}
                  />
                  <label htmlFor="published" className="ml-2 block text-sm">
                    Опубликован
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">
                Дополнительные материалы
              </label>
              <button
                type="button"
                onClick={addResource}
                className="btn-secondary py-1 px-3 flex items-center text-sm"
              >
                <FiPlus className="mr-1" />
                Добавить материал
              </button>
            </div>
            
            {resources.length === 0 ? (
              <p className="text-sm text-secondary italic">Нет дополнительных материалов</p>
            ) : (
              <div className="space-y-4">
                {resources.map((resource, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-background rounded-lg border border-gray-700">
                    <div className="col-span-4">
                      <label className="block text-xs mb-1">Название</label>
                      <input
                        type="text"
                        className="input w-full"
                        {...register(`resources.${index}.title` as const, { required: true })}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs mb-1">Тип</label>
                      <select
                        className="input w-full"
                        {...register(`resources.${index}.type` as const, { required: true })}
                      >
                        <option value="link">Ссылка</option>
                        <option value="pdf">PDF</option>
                        <option value="file">Файл</option>
                      </select>
                    </div>
                    
                    <div className="col-span-5">
                      <label className="block text-xs mb-1">URL</label>
                      <input
                        type="text"
                        className="input w-full"
                        placeholder="https://..."
                        {...register(`resources.${index}.url` as const, { required: true })}
                      />
                    </div>
                    
                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-6 border-t border-gray-800">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FiSave className="mr-2" />
              )}
              Сохранить урок
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 