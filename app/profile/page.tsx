'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiLock, FiEdit2, FiCheckCircle, FiAlertCircle, FiBookOpen, FiList, FiBookmark, FiClock } from 'react-icons/fi'
import axios from 'axios'
import Link from 'next/link'
import Image from 'next/image'

interface UserProfile {
  name: string
  email: string
  image?: string
  role: string
  enrolledCourses?: {
    course: {
      _id: string
      title: string
      slug: string
      thumbnail?: string
    }
    progress: number
    lastAccessed?: string
  }[]
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'security'>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Состояние формы
  const [name, setName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [formMessage, setFormMessage] = useState({ type: '', message: '' })
  
  // Для смены пароля
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState({ type: '', message: '' })
  
  // Перенаправление неавторизованных пользователей
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile')
    }
  }, [status, router])
  
  // Загрузка профиля пользователя
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserProfile()
    }
  }, [status, session])
  
  // Установить начальные данные формы из профиля
  useEffect(() => {
    if (profile) {
      setName(profile.name)
    }
  }, [profile])
  
  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/user/profile')
      setProfile(response.data.user)
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage({ type: '', message: '' })
    
    try {
      const response = await axios.put('/api/user/profile', { name })
      
      // Обновить профиль
      setProfile(prev => prev ? { ...prev, name } : null)
      
      // Обновить сессию
      await update({ name })
      
      setFormMessage({ type: 'success', message: 'Профиль успешно обновлен' })
      setIsEditing(false)
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error)
      setFormMessage({ type: 'error', message: 'Не удалось обновить профиль' })
    }
  }
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage({ type: '', message: '' })
    
    // Проверить, что пароли совпадают
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', message: 'Новые пароли не совпадают' })
      return
    }
    
    try {
      await axios.put('/api/user/password', { 
        currentPassword, 
        newPassword 
      })
      
      setPasswordMessage({ type: 'success', message: 'Пароль успешно изменен' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Не удалось изменить пароль'
      setPasswordMessage({ type: 'error', message: errorMessage })
    }
  }
  
  const cancelEditing = () => {
    setName(profile?.name || '')
    setIsEditing(false)
    setFormMessage({ type: '', message: '' })
  }
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок страницы и приветствие */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-secondary mt-2">
            Здравствуйте, {profile?.name}! Здесь вы можете управлять своим профилем и просматривать курсы.
          </p>
        </div>
        
        {/* Вкладки */}
        <div className="mb-8 border-b border-gray-700">
          <div className="flex flex-wrap -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`mr-6 py-3 border-b-2 font-medium text-sm flex items-center 
                ${activeTab === 'profile' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-secondary hover:text-white'}`}
            >
              <FiUser className="mr-2" />
              Профиль
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`mr-6 py-3 border-b-2 font-medium text-sm flex items-center 
                ${activeTab === 'courses' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-secondary hover:text-white'}`}
            >
              <FiBookOpen className="mr-2" />
              Мои курсы
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-3 border-b-2 font-medium text-sm flex items-center 
                ${activeTab === 'security' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-secondary hover:text-white'}`}
            >
              <FiLock className="mr-2" />
              Безопасность
            </button>
          </div>
        </div>
        
        {/* Содержимое вкладок */}
        <div className="bg-background-lighter rounded-lg border border-gray-700 p-6">
          {/* Вкладка Профиль */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 mb-4">
                    {profile?.image ? (
                      <Image
                        src={profile.image}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-secondary">
                        <FiUser />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{profile?.name}</h3>
                  <p className="text-sm text-secondary">{profile?.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                </div>
                
                <div className="md:w-2/3 md:pl-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      Информация о профиле
                      {!isEditing && (
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="ml-2 text-secondary hover:text-accent"
                          aria-label="Редактировать профиль"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      )}
                    </h3>
                    
                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Имя
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                            required
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <button 
                            type="submit" 
                            className="btn-primary"
                          >
                            Сохранить
                          </button>
                          <button 
                            type="button" 
                            onClick={cancelEditing}
                            className="btn-secondary"
                          >
                            Отмена
                          </button>
                        </div>
                        
                        {formMessage.message && (
                          <div className={`flex items-center text-sm ${
                            formMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {formMessage.type === 'success' 
                              ? <FiCheckCircle className="mr-2" /> 
                              : <FiAlertCircle className="mr-2" />
                            }
                            {formMessage.message}
                          </div>
                        )}
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-secondary mb-1">Имя</p>
                          <p>{profile?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary mb-1">Email</p>
                          <p className="flex items-center">{profile?.email}</p>
                        </div>
                        
                        {formMessage.message && (
                          <div className={`flex items-center text-sm ${
                            formMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {formMessage.type === 'success' 
                              ? <FiCheckCircle className="mr-2" /> 
                              : <FiAlertCircle className="mr-2" />
                            }
                            {formMessage.message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Активность</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-background p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center text-secondary mb-2">
                          <FiBookOpen className="mr-2" />
                          <span>Всего курсов</span>
                        </div>
                        <p className="text-2xl font-semibold">
                          {profile?.enrolledCourses?.length || 0}
                        </p>
                      </div>
                      
                      <div className="bg-background p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center text-secondary mb-2">
                          <FiBookmark className="mr-2" />
                          <span>Избранное</span>
                        </div>
                        <Link href="/favorites" className="text-2xl font-semibold hover:text-accent transition-colors">
                          Просмотреть
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Вкладка Мои курсы */}
          {activeTab === 'courses' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Мои курсы</h3>
              
              {profile?.enrolledCourses && profile.enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {profile.enrolledCourses.map((enrollment) => (
                    <div 
                      key={enrollment.course._id} 
                      className="bg-background p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4"
                    >
                      <div className="md:w-1/4 h-32 flex-shrink-0">
                        <img 
                          src={enrollment.course.thumbnail || 'https://via.placeholder.com/640x360?text=TrueSpace'} 
                          alt={enrollment.course.title} 
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=TrueSpace'
                          }}
                        />
                      </div>
                      
                      <div className="flex-grow flex flex-col">
                        <h4 className="text-lg font-medium mb-2">{enrollment.course.title}</h4>
                        
                        <div className="mb-4 flex items-center text-sm text-secondary">
                          <FiClock className="mr-1" />
                          <span>
                            {enrollment.lastAccessed 
                              ? `Последнее посещение: ${new Date(enrollment.lastAccessed).toLocaleDateString()}` 
                              : 'Еще не начат'}
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Прогресс</span>
                            <span>{Math.round(enrollment.progress)}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full" 
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <Link 
                            href={`/courses/${enrollment.course.slug}`}
                            className="btn-primary text-center inline-block"
                          >
                            {enrollment.progress > 0 ? 'Продолжить' : 'Начать'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-background p-6 border border-gray-700 rounded-lg text-center">
                  <FiList className="mx-auto text-4xl text-secondary mb-4" />
                  <h4 className="text-lg font-medium mb-2">У вас пока нет курсов</h4>
                  <p className="text-secondary mb-4">Начните учиться - запишитесь на курс</p>
                  <Link href="/courses" className="btn-primary inline-block">
                    Найти курсы
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Вкладка Безопасность */}
          {activeTab === 'security' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Смена пароля</h3>
              
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                    Текущий пароль
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                    Новый пароль
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Подтвердите новый пароль
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <button type="submit" className="btn-primary">
                    Изменить пароль
                  </button>
                  
                  {passwordMessage.message && (
                    <div className={`mt-3 flex items-center text-sm ${
                      passwordMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {passwordMessage.type === 'success' 
                        ? <FiCheckCircle className="mr-2" /> 
                        : <FiAlertCircle className="mr-2" />
                      }
                      {passwordMessage.message}
                    </div>
                  )}
                </div>
              </form>
              
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4 text-red-500">Удаление аккаунта</h3>
                <p className="text-secondary mb-4">
                  Удаление аккаунта - это необратимое действие. Все ваши данные и прогресс будут потеряны.
                </p>
                <button 
                  type="button" 
                  className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white transition-colors"
                >
                  Удалить аккаунт
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 