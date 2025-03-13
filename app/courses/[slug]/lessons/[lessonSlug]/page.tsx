'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import axios from 'axios'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import YouTubePlayer from '@/components/YouTubePlayer'
import PromoCodeForm from '@/components/PromoCodeForm'
import { FiArrowLeft, FiArrowRight, FiDownload, FiLink, FiFileText } from 'react-icons/fi'

interface LessonProps {
  params: {
    slug: string
    lessonSlug: string
  }
}

export default function LessonPage({ params }: LessonProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [lesson, setLesson] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [nextLesson, setNextLesson] = useState<any>(null)
  const [prevLesson, setPrevLesson] = useState<any>(null)
  
  // Получение данных о курсе и уроке
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Получаем данные о курсе
        const courseResponse = await axios.get(`/api/courses/${params.slug}`)
        const courseData = courseResponse.data.course
        setCourse(courseData)
        
        // Находим текущий урок
        const currentLesson = courseData.lessons.find(
          (l: any) => l.slug === params.lessonSlug
        )
        
        if (!currentLesson) {
          setError('Урок не найден')
          setLoading(false)
          return
        }
        
        // Получаем полные данные об уроке
        const lessonResponse = await axios.get(`/api/lessons/${currentLesson._id}`)
        setLesson(lessonResponse.data.lesson)
        
        // Определяем предыдущий и следующий уроки
        const currentIndex = courseData.lessons.findIndex(
          (l: any) => l.slug === params.lessonSlug
        )
        
        if (currentIndex > 0) {
          setPrevLesson(courseData.lessons[currentIndex - 1])
        }
        
        if (currentIndex < courseData.lessons.length - 1) {
          setNextLesson(courseData.lessons[currentIndex + 1])
        }
        
        // Проверяем доступ к уроку
        if (currentLesson.requiresPromoCode) {
          const accessCheckResponse = await axios.get(`/api/lessons/${currentLesson._id}/access`)
          setHasAccess(accessCheckResponse.data.hasAccess)
        } else {
          setHasAccess(true)
        }
        
        // Получаем прогресс просмотра если пользователь авторизован
        if (session?.user) {
          const progressResponse = await axios.get(`/api/lessons/${currentLesson._id}/progress`)
          if (progressResponse.data.progress) {
            setProgress(progressResponse.data.progress)
          }
        }
        
      } catch (error: any) {
        console.error('Error fetching lesson:', error)
        setError(error.response?.data?.message || 'Ошибка загрузки урока')
      } finally {
        setLoading(false)
      }
    }
    
    if (status !== 'loading') {
      fetchData()
    }
  }, [params.slug, params.lessonSlug, status, session])
  
  // Обновление прогресса просмотра
  const handleTimeUpdate = async (currentTime: number) => {
    if (!session?.user || !lesson) return
    
    try {
      await axios.post(`/api/lessons/${lesson._id}/progress`, {
        progress: Math.round((currentTime / lesson.duration) * 100),
        lastWatched: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }
  
  // Обработчик успешного ввода промокода
  const handlePromoCodeSuccess = () => {
    setHasAccess(true)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500 mb-4">{error}</h1>
          <button 
            onClick={() => router.push(`/courses/${params.slug}`)}
            className="btn-primary"
          >
            Вернуться к курсу
          </button>
        </div>
      </div>
    )
  }
  
  if (!lesson) {
    return null
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Навигация по курсу */}
          <div className="py-4 mb-6">
            <button
              onClick={() => router.push(`/courses/${params.slug}`)}
              className="text-secondary hover:text-primary flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Вернуться к курсу: {course?.title}
            </button>
          </div>
          
          {/* Основной контент */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{lesson.title}</h1>
              
              {/* Видеоплеер или форма промокода */}
              {hasAccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <YouTubePlayer 
                    videoId={lesson.youtubeId} 
                    startTime={progress > 0 ? Math.floor(lesson.duration * (progress / 100)) : 0}
                    onTimeUpdate={handleTimeUpdate}
                    className="mb-8"
                  />
                  
                  <div className="prose prose-invert max-w-none mb-8">
                    <h2 className="text-xl font-semibold mb-4">Описание</h2>
                    <div dangerouslySetInnerHTML={{ __html: lesson.description }} />
                  </div>
                  
                  {/* Дополнительные материалы */}
                  {lesson.resources && lesson.resources.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Дополнительные материалы</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lesson.resources.map((resource: any, index: number) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-4 bg-background-lighter rounded-lg transition-colors hover:bg-background-light"
                          >
                            {resource.type === 'pdf' && <FiFileText className="w-5 h-5 mr-3 text-accent" />}
                            {resource.type === 'link' && <FiLink className="w-5 h-5 mr-3 text-accent" />}
                            {resource.type === 'file' && <FiDownload className="w-5 h-5 mr-3 text-accent" />}
                            <div>
                              <div className="font-medium">{resource.title}</div>
                              <div className="text-sm text-secondary">{resource.type.toUpperCase()}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <PromoCodeForm 
                    lessonId={lesson._id} 
                    courseId={course._id}
                    onSuccess={handlePromoCodeSuccess} 
                  />
                </motion.div>
              )}
            </div>
            
            {/* Боковая панель с уроками курса */}
            <div className="lg:col-span-1">
              <div className="bg-background-lighter p-6 rounded-lg shadow-subtle">
                <h2 className="text-xl font-semibold mb-4">Уроки курса</h2>
                
                <div className="space-y-3">
                  {course?.lessons.map((courseLesson: any, index: number) => (
                    <a
                      key={courseLesson._id}
                      href={`/courses/${params.slug}/lessons/${courseLesson.slug}`}
                      className={`flex items-center p-3 rounded-md transition-colors ${
                        courseLesson.slug === params.lessonSlug
                          ? 'bg-accent/20 text-white'
                          : 'hover:bg-background-light text-secondary'
                      }`}
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-background-light flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{courseLesson.title}</div>
                        <div className="text-xs text-secondary">
                          {Math.floor(courseLesson.duration / 60)} мин
                          {courseLesson.requiresPromoCode && " • Требуется промокод"}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Навигация по урокам */}
          <div className="mt-12 flex justify-between">
            {prevLesson ? (
              <button
                onClick={() => router.push(`/courses/${params.slug}/lessons/${prevLesson.slug}`)}
                className="flex items-center btn-secondary"
              >
                <FiArrowLeft className="mr-2" />
                Предыдущий урок
              </button>
            ) : (
              <div></div>
            )}
            
            {nextLesson ? (
              <button
                onClick={() => router.push(`/courses/${params.slug}/lessons/${nextLesson.slug}`)}
                className="flex items-center btn-primary"
              >
                Следующий урок
                <FiArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                onClick={() => router.push(`/courses/${params.slug}`)}
                className="flex items-center btn-primary"
              >
                Завершить курс
                <FiArrowRight className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 