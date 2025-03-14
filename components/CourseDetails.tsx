'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { FiClock, FiStar, FiBookOpen, FiUser, FiCalendar, FiTag, FiHeart, FiShare2 } from 'react-icons/fi'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Author {
  _id: string
  name: string
  image?: string
}

interface Lesson {
  _id: string
  title: string
  description?: string
  duration?: number
  isFree: boolean
  videoUrl?: string
  order: number
}

interface Course {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail?: string
  category?: string
  level?: string
  duration?: number
  featured?: boolean
  tags?: string[]
  createdAt: string
  author?: Author
  lessons?: Lesson[]
  price?: number
  discount?: number
}

export default function CourseDetails({ course }: { course: Course }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  
  const levelLabels = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  } as {[key: string]: string}
  
  const categoryLabels = {
    programming: 'Программирование',
    design: 'Дизайн',
    business: 'Бизнес',
    marketing: 'Маркетинг',
    'personal-development': 'Личностное развитие',
    other: 'Другое'
  } as {[key: string]: string}
  
  useEffect(() => {
    if (session?.user) {
      checkEnrollmentStatus()
      checkFavoriteStatus()
    }
    fetchLessons()
  }, [session])
  
  const checkEnrollmentStatus = async () => {
    try {
      const response = await axios.get(`/api/users/enrollments?courseId=${course._id}`)
      setIsEnrolled(response.data.isEnrolled)
    } catch (error) {
      console.error('Ошибка при проверке статуса зачисления:', error)
    }
  }
  
  const checkFavoriteStatus = async () => {
    try {
      const response = await axios.get(`/api/users/favorites?courseId=${course._id}`)
      setIsInFavorites(response.data.isInFavorites)
    } catch (error) {
      console.error('Ошибка при проверке статуса избранного:', error)
    }
  }
  
  const fetchLessons = async () => {
    try {
      const response = await axios.get(`/api/courses/${course._id}/lessons`)
      setLessons(response.data.lessons || [])
    } catch (error) {
      console.error('Ошибка при загрузке уроков:', error)
    }
  }
  
  const handleEnroll = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/courses/${course.slug}`)
      return
    }
    
    setIsLoading(true)
    try {
      await axios.post('/api/users/enrollments', { courseId: course._id })
      setIsEnrolled(true)
      toast.success('Вы успешно записались на курс!')
    } catch (error) {
      console.error('Ошибка при записи на курс:', error)
      toast.error('Не удалось записаться на курс. Пожалуйста, попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const toggleFavorite = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/courses/${course.slug}`)
      return
    }
    
    try {
      if (isInFavorites) {
        await axios.delete(`/api/users/favorites?courseId=${course._id}`)
        setIsInFavorites(false)
        toast.success('Курс удален из избранного')
      } else {
        await axios.post('/api/users/favorites', { courseId: course._id })
        setIsInFavorites(true)
        toast.success('Курс добавлен в избранное')
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error)
      toast.error('Не удалось обновить избранное. Пожалуйста, попробуйте позже.')
    }
  }
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course.title,
          text: course.description,
          url: shareUrl
        })
      } catch (error) {
        console.error('Ошибка при попытке поделиться:', error)
      }
    } else {
      // Копирование URL в буфер обмена, если API share недоступен
      navigator.clipboard.writeText(shareUrl)
      toast.success('Ссылка скопирована в буфер обмена')
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }
  
  const calculateDiscountedPrice = () => {
    if (!course.price) return 0
    if (!course.discount) return course.price
    
    return course.price - (course.price * course.discount / 100)
  }
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Верхняя секция с информацией о курсе */}
        <div className="bg-background-lighter rounded-lg overflow-hidden shadow-subtle mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:p-8">
            {/* Изображение курса */}
            <div className="lg:col-span-1">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img 
                  src={course.thumbnail || 'https://via.placeholder.com/640x360?text=TrueSpace'} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=TrueSpace'
                  }}
                />
                {course.featured && (
                  <div className="absolute top-3 right-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                    Популярный
                  </div>
                )}
              </div>
              
              {/* Кнопки действий */}
              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={isEnrolled ? () => router.push(`/courses/${course.slug}/learn`) : handleEnroll}
                  disabled={isLoading}
                  className={`btn-primary w-full py-3 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : null}
                  {isEnrolled ? 'Продолжить обучение' : 'Записаться на курс'}
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={toggleFavorite}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition-colors ${
                      isInFavorites 
                        ? 'bg-accent/10 border-accent text-accent' 
                        : 'border-gray-700 text-secondary hover:border-accent hover:text-accent'
                    }`}
                  >
                    <FiHeart className={`mr-2 ${isInFavorites ? 'fill-accent' : ''}`} />
                    {isInFavorites ? 'В избранном' : 'В избранное'}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2 rounded-lg border border-gray-700 text-secondary hover:border-accent hover:text-accent flex items-center justify-center transition-colors"
                  >
                    <FiShare2 className="mr-2" />
                    Поделиться
                  </button>
                </div>
              </div>
            </div>
            
            {/* Информация о курсе */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              
              <p className="text-secondary mb-6">{course.description}</p>
              
              {/* Метаданные курса */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-xs text-secondary mb-1">Категория</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">
                      {categoryLabels[course.category || ''] || course.category || 'Общее'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-secondary mb-1">Уровень</span>
                  <div className="flex items-center">
                    <FiStar className="mr-1 text-secondary" size={14} />
                    <span className="text-sm font-medium">
                      {course.level ? levelLabels[course.level] || course.level : 'Начинающий'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-secondary mb-1">Длительность</span>
                  <div className="flex items-center">
                    <FiClock className="mr-1 text-secondary" size={14} />
                    <span className="text-sm font-medium">
                      {course.duration ? `${course.duration} мин.` : 'Не указано'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-secondary mb-1">Уроков</span>
                  <div className="flex items-center">
                    <FiBookOpen className="mr-1 text-secondary" size={14} />
                    <span className="text-sm font-medium">{lessons.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Дополнительная информация */}
              <div className="border-t border-gray-700 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.author && (
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3 flex-shrink-0">
                        {course.author.image ? (
                          <img 
                            src={course.author.image} 
                            alt={course.author.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-full h-full p-2 text-secondary" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-secondary">Автор</span>
                        <p className="font-medium">{course.author.name}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <FiCalendar className="w-10 h-10 p-2 rounded-full bg-gray-700 mr-3 text-secondary flex-shrink-0" />
                    <div>
                      <span className="text-xs text-secondary">Дата создания</span>
                      <p className="font-medium">{formatDate(course.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Цена курса */}
              {course.price !== undefined && (
                <div className="mt-6 flex items-center">
                  <span className="text-2xl font-bold mr-3">
                    {course.discount ? (
                      <>
                        {calculateDiscountedPrice()} ₽
                        <span className="text-secondary line-through text-lg ml-2">
                          {course.price} ₽
                        </span>
                      </>
                    ) : (
                      `${course.price} ₽`
                    )}
                  </span>
                  
                  {course.discount && (
                    <span className="bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                      Скидка {course.discount}%
                    </span>
                  )}
                </div>
              )}
              
              {/* Теги */}
              {course.tags && course.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center flex-wrap gap-2">
                    <FiTag className="text-secondary" />
                    {course.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-gray-800 text-secondary rounded-full px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Содержание курса */}
        <div className="bg-background-lighter rounded-lg overflow-hidden shadow-subtle p-6 lg:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Содержание курса</h2>
          
          {lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson, index) => (
                  <div 
                    key={lesson._id} 
                    className="border border-gray-700 rounded-lg p-4 hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <div className="bg-gray-800 text-secondary rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-sm text-secondary mt-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {lesson.duration && (
                          <span className="text-xs text-secondary flex items-center mr-3">
                            <FiClock className="mr-1" />
                            {lesson.duration} мин.
                          </span>
                        )}
                        
                        {lesson.isFree ? (
                          <span className="text-xs bg-green-900/30 text-green-400 rounded-full px-2 py-1">
                            Бесплатно
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-800 text-secondary rounded-full px-2 py-1">
                            Премиум
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-secondary">Уроки для этого курса еще не добавлены.</p>
          )}
        </div>
        
        {/* Призыв к действию */}
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 lg:p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Готовы начать обучение?</h2>
          <p className="text-secondary mb-6 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам студентов, которые уже улучшили свои навыки с помощью наших курсов.
          </p>
          <button
            onClick={isEnrolled ? () => router.push(`/courses/${course.slug}/learn`) : handleEnroll}
            disabled={isLoading}
            className={`btn-primary py-3 px-8 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
            ) : null}
            {isEnrolled ? 'Продолжить обучение' : 'Записаться на курс'}
          </button>
        </div>
      </div>
    </div>
  )
} 