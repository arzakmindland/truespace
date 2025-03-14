'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { FiHeart } from 'react-icons/fi'
import CourseCard from './CourseCard'

interface Course {
  _id: string
  title: string
  description: string
  thumbnail: string
  slug: string
  price: number
  level: string
  tags: string[]
}

export default function FavoritesContent() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/user/favorites')
      setFavorites(response.data.favorites || [])
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error)
      setError('Не удалось загрузить избранные курсы')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromFavorites = async (courseId: string) => {
    try {
      await axios.delete(`/api/user/favorites/${courseId}`)
      setFavorites(favorites.filter(course => course._id !== courseId))
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error)
      setError('Не удалось удалить курс из избранного')
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Избранные курсы</h1>
          <button
            onClick={() => router.push('/courses')}
            className="btn-primary"
          >
            Найти больше курсов
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(course => (
              <div key={course._id} className="relative">
                <CourseCard course={course} />
                <button
                  onClick={() => handleRemoveFromFavorites(course._id)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md hover:bg-red-50 transition-colors"
                  aria-label="Удалить из избранного"
                >
                  <FiHeart className="fill-current" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-background-lighter p-8 rounded-lg shadow-subtle text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <FiHeart size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2">У вас пока нет избранных курсов</h2>
            <p className="text-secondary mb-6">Добавляйте курсы в избранное, чтобы быстро находить их позже</p>
            <button
              onClick={() => router.push('/courses')}
              className="btn-primary"
            >
              Найти курсы
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 