'use client'

import { useState, useEffect } from 'react'
import { FiBookmark, FiSearch, FiX, FiTrash2, FiClock, FiStar, FiInfo } from 'react-icons/fi'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface SavedCourse {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail?: string
  category?: string
  level?: string
  duration?: number
  featured?: boolean
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<SavedCourse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFavorites, setFilteredFavorites] = useState<SavedCourse[]>([])
  
  // Перенаправить неавторизованных пользователей на страницу входа
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/favorites')
    }
  }, [status, router])
  
  // Загрузить сохраненные курсы
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchFavorites()
    }
  }, [status, session])
  
  // Фильтровать курсы при изменении поискового запроса
  useEffect(() => {
    if (!searchQuery) {
      setFilteredFavorites(favorites)
    } else {
      const filtered = favorites.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredFavorites(filtered)
    }
  }, [searchQuery, favorites])
  
  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/user/favorites')
      setFavorites(response.data.favorites || [])
      setFilteredFavorites(response.data.favorites || [])
    } catch (error) {
      console.error('Ошибка при загрузке избранных курсов:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const removeFavorite = async (courseId: string) => {
    try {
      await axios.delete(`/api/user/favorites/${courseId}`)
      
      // Обновить локальное состояние, удалив курс из списка
      const updatedFavorites = favorites.filter(course => course._id !== courseId)
      setFavorites(updatedFavorites)
      
      // Также обновить отфильтрованный список
      const updatedFiltered = filteredFavorites.filter(course => course._id !== courseId)
      setFilteredFavorites(updatedFiltered)
    } catch (error) {
      console.error('Ошибка при удалении курса из избранного:', error)
    }
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Поиск происходит в useEffect при изменении searchQuery
  }
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background pt-24 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Избранные курсы</h1>
            <p className="text-secondary">
              {favorites.length > 0 
                ? `У вас ${favorites.length} сохраненных курсов`
                : 'У вас нет сохраненных курсов'}
            </p>
          </div>
          
          {/* Поиск */}
          <div className="mt-4 md:mt-0 md:w-1/3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск в избранном..."
                className="w-full py-2 px-4 pl-10 rounded-lg bg-background-lighter border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-white"
                >
                  <FiX />
                </button>
              )}
            </form>
          </div>
        </div>
        
        {/* Список курсов */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((course) => (
              <CourseCard 
                key={course._id} 
                course={course} 
                onRemove={removeFavorite}
              />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="text-center py-12">
            <FiSearch className="mx-auto text-4xl text-secondary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Курсы не найдены</h2>
            <p className="text-secondary mb-6">
              Не найдено курсов, соответствующих вашему запросу.
            </p>
            <button onClick={() => setSearchQuery('')} className="btn-primary">
              Показать все избранные
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-background-lighter rounded-lg border border-gray-700 p-8">
            <FiBookmark className="mx-auto text-4xl text-secondary mb-4" />
            <h2 className="text-xl font-semibold mb-2">У вас пока нет избранных курсов</h2>
            <p className="text-secondary mb-6">
              Добавляйте курсы в избранное, чтобы быстро находить их позже
            </p>
            <Link href="/search" className="btn-primary">
              Найти курсы
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course, onRemove }: { course: SavedCourse, onRemove: (id: string) => void }) {
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
  
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="bg-background-lighter rounded-lg overflow-hidden shadow-subtle hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48">
        <Link href={`/courses/${course.slug}`}>
          <img 
            src={course.thumbnail || 'https://via.placeholder.com/640x360?text=TrueSpace'} 
            alt={course.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=TrueSpace'
            }}
          />
        </Link>
        
        {course.featured && (
          <div className="absolute top-3 left-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
            Популярный
          </div>
        )}
        
        <button 
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 
            ${isHovered ? 'bg-red-500 text-white' : 'bg-gray-800 text-secondary'}`}
          onClick={() => onRemove(course._id)}
          aria-label="Удалить из избранного"
        >
          {isHovered ? <FiTrash2 size={16} /> : <FiBookmark size={16} />}
        </button>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center text-xs text-secondary mb-2">
          <div className="flex items-center mr-3">
            <FiStar className="mr-1" />
            <span>
              {course.level ? levelLabels[course.level] || course.level : 'Начинающий'}
            </span>
          </div>
          <div className="flex items-center">
            <FiClock className="mr-1" />
            <span>{course.duration ? `${course.duration} мин.` : 'Курс'}</span>
          </div>
        </div>
        
        <Link href={`/courses/${course.slug}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-accent transition-colors">{course.title}</h3>
        </Link>
        
        <p className="text-secondary text-sm line-clamp-2 mb-3 flex-grow">
          {course.description}
        </p>
        
        <div className="mt-auto">
          <div className="text-xs inline-block bg-gray-800 text-secondary rounded-full px-3 py-1">
            {categoryLabels[course.category || ''] || course.category || 'Общее'}
          </div>
        </div>
      </div>
    </div>
  )
} 