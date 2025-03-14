'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiX, FiBook, FiVideo, FiClock, FiStar } from 'react-icons/fi'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [level, setLevel] = useState(searchParams.get('level') || '')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Выполнить поиск при изменении параметров
  useEffect(() => {
    if (searchQuery) {
      performSearch()
    } else {
      // Если строка поиска пуста, но есть фильтры, всё равно ищем
      if (category || level) {
        performSearch()
      } else {
        // Если ничего не указано, показываем популярные курсы
        fetchPopularCourses()
      }
    }
  }, [searchParams])
  
  const performSearch = async () => {
    setIsLoading(true)
    try {
      // Добавляем параметры поиска и фильтров
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (category) params.append('category', category)
      if (level) params.append('level', level)
      
      const response = await axios.get(`/api/courses?${params.toString()}`)
      setResults(response.data.courses || [])
    } catch (error) {
      console.error('Error searching courses:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchPopularCourses = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/courses?featured=true')
      setResults(response.data.courses || [])
    } catch (error) {
      console.error('Error fetching popular courses:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Обновляем URL с параметрами поиска
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (category) params.append('category', category) 
    if (level) params.append('level', level)
    
    router.push(`/search?${params.toString()}`)
  }
  
  const clearFilters = () => {
    setCategory('')
    setLevel('')
    
    // Обновляем URL только с поисковым запросом
    if (searchQuery) {
      router.push(`/search?q=${searchQuery}`)
    } else {
      router.push('/search')
    }
  }
  
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)
  }
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Поиск курсов</h1>
          
          {/* Форма поиска */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Что вы хотите изучить?"
                className="w-full py-3 px-4 pl-12 rounded-lg bg-background-lighter border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
            </div>
            
            <div className="md:hidden">
              <button 
                type="button" 
                onClick={toggleFilters}
                className="w-full py-3 px-4 rounded-lg bg-background-lighter border border-gray-700 flex items-center justify-center"
              >
                <FiFilter className="mr-2" />
                Фильтры
              </button>
            </div>
            
            {/* Десктопные фильтры */}
            <div className="hidden md:flex gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="py-3 px-4 rounded-lg bg-background-lighter border border-gray-700 focus:border-accent outline-none"
              >
                <option value="">Все категории</option>
                <option value="programming">Программирование</option>
                <option value="design">Дизайн</option>
                <option value="business">Бизнес</option>
                <option value="marketing">Маркетинг</option>
                <option value="personal-development">Личностное развитие</option>
                <option value="other">Другое</option>
              </select>
              
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="py-3 px-4 rounded-lg bg-background-lighter border border-gray-700 focus:border-accent outline-none"
              >
                <option value="">Все уровни</option>
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
              
              <button type="submit" className="btn-primary min-w-[120px]">
                Найти
              </button>
              
              {(category || level) && (
                <button 
                  type="button" 
                  onClick={clearFilters} 
                  className="flex items-center text-secondary hover:text-white"
                >
                  <FiX className="mr-1" /> Сбросить
                </button>
              )}
            </div>
          </form>
          
          {/* Мобильные фильтры */}
          {isFiltersOpen && (
            <div className="md:hidden mt-4 p-4 bg-background-lighter rounded-lg border border-gray-700">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent outline-none"
                >
                  <option value="">Все категории</option>
                  <option value="programming">Программирование</option>
                  <option value="design">Дизайн</option>
                  <option value="business">Бизнес</option>
                  <option value="marketing">Маркетинг</option>
                  <option value="personal-development">Личностное развитие</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Уровень сложности</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent outline-none"
                >
                  <option value="">Все уровни</option>
                  <option value="beginner">Начинающий</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={handleSearch} 
                  className="btn-primary flex-grow"
                >
                  Применить
                </button>
                
                {(category || level) && (
                  <button 
                    type="button" 
                    onClick={clearFilters} 
                    className="btn-secondary flex-grow"
                  >
                    Сбросить
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Результаты поиска */}
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : results.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {searchQuery 
                  ? `Результаты поиска для "${searchQuery}"`
                  : category || level 
                    ? 'Отфильтрованные курсы' 
                    : 'Популярные курсы'
                }
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FiSearch className="mx-auto text-4xl text-secondary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Курсы не найдены</h2>
              <p className="text-secondary mb-6">
                К сожалению, мы не нашли курсов, соответствующих вашему запросу.
              </p>
              <button onClick={clearFilters} className="btn-primary">
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
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
  
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-background-lighter rounded-lg overflow-hidden shadow-subtle hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48">
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
          
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <p className="text-secondary text-sm line-clamp-2 mb-3 flex-grow">
            {course.description}
          </p>
          
          <div className="mt-auto">
            <div className="text-xs inline-block bg-gray-800 text-secondary rounded-full px-3 py-1">
              {categoryLabels[course.category] || course.category || 'Общее'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 