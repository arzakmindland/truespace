'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import axios from 'axios'
import { FiUser, FiMail, FiEdit, FiLogOut, FiBookOpen, FiHeart, FiSettings } from 'react-icons/fi'

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
}

interface ProfileContentProps {
  user: User
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('courses')
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Загрузка данных пользователя
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      // Загрузка записанных курсов
      const enrolledResponse = await axios.get('/api/user/courses')
      setEnrolledCourses(enrolledResponse.data.courses || [])
      
      // Загрузка избранных курсов
      const favoritesResponse = await axios.get('/api/user/favorites')
      setFavorites(favoritesResponse.data.favorites || [])
    } catch (error) {
      console.error('Ошибка при загрузке данных пользователя:', error)
      setError('Не удалось загрузить данные профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const response = await axios.put('/api/user/profile', { name })
      setSuccess('Профиль успешно обновлен')
      setIsEditing(false)
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error)
      setError('Не удалось обновить профиль')
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Боковая панель */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-background-lighter rounded-lg p-6 shadow-subtle mb-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent mr-4">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name || 'Пользователь'} 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=User'
                      }}
                    />
                  ) : (
                    <FiUser size={32} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-secondary">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`w-full text-left py-2 px-3 rounded-lg flex items-center ${activeTab === 'courses' ? 'bg-accent text-white' : 'hover:bg-background'}`}
                >
                  <FiBookOpen className="mr-3" />
                  Мои курсы
                </button>
                <button 
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full text-left py-2 px-3 rounded-lg flex items-center ${activeTab === 'favorites' ? 'bg-accent text-white' : 'hover:bg-background'}`}
                >
                  <FiHeart className="mr-3" />
                  Избранное
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left py-2 px-3 rounded-lg flex items-center ${activeTab === 'settings' ? 'bg-accent text-white' : 'hover:bg-background'}`}
                >
                  <FiSettings className="mr-3" />
                  Настройки
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-3 rounded-lg flex items-center text-red-500 hover:bg-background"
                >
                  <FiLogOut className="mr-3" />
                  Выйти
                </button>
              </div>
            </div>
            
            {user.role === 'admin' && (
              <div className="bg-background-lighter rounded-lg p-6 shadow-subtle">
                <h3 className="font-semibold mb-4">Панель администратора</h3>
                <button 
                  onClick={() => router.push('/admin')}
                  className="w-full py-2 px-4 bg-accent text-white rounded-lg"
                >
                  Перейти в админ-панель
                </button>
              </div>
            )}
          </div>
          
          {/* Основное содержимое */}
          <div className="flex-grow">
            {/* Сообщения об ошибках и успехе */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-lg mb-6">
                {success}
              </div>
            )}
            
            {/* Содержимое вкладок */}
            {activeTab === 'courses' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Мои курсы</h1>
                
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : enrolledCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Здесь будет список записанных курсов */}
                    <div className="bg-background-lighter p-6 rounded-lg shadow-subtle">
                      <p>Список курсов будет здесь</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-background-lighter p-6 rounded-lg shadow-subtle text-center">
                    <p className="text-secondary mb-4">У вас пока нет записанных курсов</p>
                    <button 
                      onClick={() => router.push('/courses')}
                      className="btn-primary"
                    >
                      Найти курсы
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Избранное</h1>
                
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Здесь будет список избранных курсов */}
                    <div className="bg-background-lighter p-6 rounded-lg shadow-subtle">
                      <p>Список избранных курсов будет здесь</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-background-lighter p-6 rounded-lg shadow-subtle text-center">
                    <p className="text-secondary mb-4">У вас пока нет избранных курсов</p>
                    <button 
                      onClick={() => router.push('/courses')}
                      className="btn-primary"
                    >
                      Найти курсы
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Настройки профиля</h1>
                
                <div className="bg-background-lighter p-6 rounded-lg shadow-subtle">
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Имя</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent outline-none"
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
                          onClick={() => {
                            setIsEditing(false)
                            setName(user.name || '')
                          }}
                          className="btn-secondary"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-sm text-secondary mb-1">Имя</h3>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-sm text-secondary mb-1">Email</h3>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="btn-primary flex items-center"
                      >
                        <FiEdit className="mr-2" /> Редактировать профиль
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 