'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FiHome, 
  FiBook, 
  FiVideo, 
  FiUsers, 
  FiTag, 
  FiSettings, 
  FiLogOut, 
  FiPlus,
  FiAlertCircle,
  FiInfo,
  FiChevronRight
} from 'react-icons/fi'
import axios from 'axios'

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Проверка авторизации
  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'admin') {
      router.push('/auth/login?callbackUrl=/admin')
    } else {
      // Загружаем курсы после успешной авторизации
      fetchCourses()
    }
  }, [session, status, router])

  // Получение всех курсов
  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/courses')
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Ошибка при загрузке курсов:', error)
      setError('Не удалось загрузить курсы')
    } finally {
      setIsLoading(false)
    }
  }

  // Если статус проверки авторизации еще загружается
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Если пользователь не авторизован, показываем сообщение вместо редиректа (редирект происходит в useEffect)
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Панель администратора
          </h1>
          <p className="text-secondary mt-2">
            Добро пожаловать, {session.user.name}! Управляйте контентом и настройками вашей платформы.
          </p>
        </header>
        
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

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            icon={<FiBook />} 
            title="Курсы" 
            value={courses.length.toString()} 
            description="Всего курсов" 
          />
          <StatsCard 
            icon={<FiVideo />} 
            title="Уроки" 
            value={courses.reduce((total, course) => total + (course.lessons?.length || 0), 0).toString()} 
            description="Всего уроков" 
          />
          <StatsCard 
            icon={<FiUsers />} 
            title="Пользователи" 
            value="⏳" 
            description="Загрузка..." 
          />
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Управление курсами</h2>
            <Link href="/admin/courses/new" className="btn-secondary text-sm flex items-center">
              <FiPlus className="mr-1" /> Создать курс
            </Link>
          </div>

          <div className="bg-background-lighter rounded-lg shadow-subtle overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-secondary">Загрузка курсов...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center">
                <FiInfo className="mx-auto text-secondary text-2xl mb-3" />
                <p className="text-secondary mb-4">Список курсов пуст</p>
                <Link href="/admin/courses/new" className="btn-primary inline-flex items-center text-sm">
                  <FiPlus className="mr-1" /> Создать первый курс
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {courses.map((course) => (
                  <Link 
                    key={course._id} 
                    href={`/admin/courses/${course._id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-secondary truncate max-w-md">
                        {course.description || 'Без описания'}
                      </p>
                      <div className="flex items-center text-xs text-secondary mt-1">
                        <span className="flex items-center mr-3">
                          <FiVideo className="mr-1" /> {course.lessons?.length || 0} уроков
                        </span>
                        {course.published ? (
                          <span className="text-green-400">Опубликован</span>
                        ) : (
                          <span className="text-yellow-400">Черновик</span>
                        )}
                      </div>
                    </div>
                    <FiChevronRight className="text-secondary" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminCard 
            icon={<FiTag />} 
            title="Промокоды" 
            description="Управление промокодами и скидками" 
            href="/admin/promocodes" 
          />
          <AdminCard 
            icon={<FiUsers />} 
            title="Пользователи" 
            description="Управление учетными записями" 
            href="/admin/users" 
          />
          <AdminCard 
            icon={<FiSettings />} 
            title="Настройки" 
            description="Настройки платформы" 
            href="/admin/settings" 
          />
        </section>
      </div>
    </div>
  )
}

// Компонент карточки статистики
function StatsCard({ icon, title, value, description }: { 
  icon: React.ReactNode, 
  title: string, 
  value: string, 
  description: string 
}) {
  return (
    <div className="bg-background-lighter rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg">{title}</h3>
        <div className="p-2 bg-accent/10 text-accent rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-secondary">{description}</p>
    </div>
  )
}

// Компонент карточки навигации
function AdminCard({ icon, title, description, href }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  href: string 
}) {
  return (
    <Link href={href} className="block">
      <div className="bg-background-lighter rounded-lg p-6 shadow-subtle hover:shadow-md hover:bg-gray-800/70 transition-all">
        <div className="p-3 bg-accent/10 text-accent rounded-lg inline-block mb-4">
          {icon}
        </div>
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-sm text-secondary">{description}</p>
      </div>
    </Link>
  )
} 