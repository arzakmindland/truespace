'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiX, FiClock, FiStar, FiGrid, FiList } from 'react-icons/fi'
import Link from 'next/link'
import axios from 'axios'
import { useSearchParams, useRouter } from 'next/navigation'

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
}

export default function CoursesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Состояние
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Фильтры
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  
  // Категории и уровни сложности
  const categories = [
    { id: 'programming', name: 'Программирование' },
    { id: 'design', name: 'Дизайн' },
    { id: 'business', name: 'Бизнес' },
    { id: 'marketing', name: 'Маркетинг' },
    { id: 'personal-development', name: 'Личностное развитие' },
    { id: 'other', name: 'Другое' }
  ]
  
  const levels = [
    { id: 'beginner', name: 'Начинающий' },
    { id: 'intermediate', name: 'Средний' },
    { id: 'advanced', name: 'Продвинутый' }
  ]
  
  // Загрузить курсы при монтировании компонента
  useEffect(() => {
    fetchCourses()
  }, [])
  
  // Применить фильтры и сортировку при изменении параметров
  useEffect(() => {
    applyFiltersAndSort()
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy])
  
  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/courses')
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Ошибка при загрузке курсов:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const applyFiltersAndSort = () => {
    // Применить фильтры
    let filtered = [...courses]
    
    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }
    
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel)
    }
    
    // Применить сортировку
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        break
    }
    
    setFilteredCourses(filtered)
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURLParams()
  }
  
  const updateURLParams = () => {
    const params = new URLSearchParams()
    
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedLevel) params.set('level', selectedLevel)
    if (sortBy) params.set('sort', sortBy)
    
    router.push(`/courses?${params.toString()}`)
  }
  
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedLevel('')
    setSortBy('newest')
    router.push('/courses')
  }
  
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)
  }
  
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Все курсы</h1>
          
          {/* Форма поиска и фильтров */}
          <div className="bg-background-lighter p-6 rounded-lg border border-gray-700 mb-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Поисковая строка */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Что вы хотите изучить?"
                  className="w-full py-3 px-4 pl-12 rounded-lg bg-background border border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary" size={18} />
              </div>
              
              {/* Мобильная кнопка фильтров */}
              <div className="md:hidden">
                <button 
                  type="button" 
                  onClick={toggleFilters}
                  className="w-full py-3 px-4 rounded-lg bg-background border border-gray-700 flex items-center justify-center"
                >
                  <FiFilter className="mr-2" />
                  {isFiltersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
              </div>
              
              {/* Фильтры для десктопа или если открыты на мобильных */}
              <div className={`${isFiltersOpen ? 'block' : 'hidden md:block'} space-y-6`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Категория */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Категория</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent outline-none"
                    >
                      <option value="">Все категории</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Уровень сложности */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Уровень сложности</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent outline-none"
                    >
                      <option value="">Все уровни</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Сортировка */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Сортировка</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full py-2 px-3 rounded-lg bg-background border border-gray-700 focus:border-accent outline-none"
                    >
                      <option value="newest">Сначала новые</option>
                      <option value="oldest">Сначала старые</option>
                      <option value="name-asc">По названию (А-Я)</option>
                      <option value="name-desc">По названию (Я-А)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <button type="submit" className="btn-primary min-w-[120px]">
                      Применить
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={clearFilters} 
                      className="btn-secondary min-w-[120px]"
                    >
                      Сбросить
                    </button>
                  </div>
                  
                  {/* Переключатель отображения (только на десктопе) */}
                  <div className="hidden md:flex items-center border border-gray-700 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-white' : 'bg-background text-secondary'}`}
                      aria-label="Grid view"
                    >
                      <FiGrid size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-accent text-white' : 'bg-background text-secondary'}`}
                      aria-label="List view"
                    >
                      <FiList size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Количество найденных курсов */}
          {!isLoading && (
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-secondary">
                {filteredCourses.length > 0
                  ? `Найдено ${filteredCourses.length} курсов`
                  : 'Курсы не найдены'}
              </p>
              
              {/* Переключатель отображения (только на мобильных) */}
              <div className="md:hidden flex items-center border border-gray-700 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-white' : 'bg-background text-secondary'}`}
                  aria-label="Grid view"
                >
                  <FiGrid size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-accent text-white' : 'bg-background text-secondary'}`}
                  aria-label="List view"
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          )}
          
          {/* Результаты - Отображение курсов */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            viewMode === 'grid' ? (
              // Сетка курсов
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              // Список курсов
              <div className="space-y-4">
                {filteredCourses.map(course => (
                  <CourseListItem key={course._id} course={course} />
                ))}
              </div>
            )
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

// Компонент карточки курса для отображения сеткой
function CourseCard({ course }: { course: Course }) {
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
              {categoryLabels[course.category || ''] || course.category || 'Общее'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Компонент элемента списка курса для отображения списком
function CourseListItem({ course }: { course: Course }) {
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
      <div className="bg-background-lighter rounded-lg overflow-hidden shadow-subtle hover:shadow-md transition-shadow duration-300 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-48 h-32 flex-shrink-0">
            <img 
              src={course.thumbnail || 'https://via.placeholder.com/640x360?text=TrueSpace'} 
              alt={course.title} 
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=TrueSpace'
              }}
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-wrap gap-2 mb-2">
              {course.featured && (
                <div className="bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                  Популярный
                </div>
              )}
              
              <div className="bg-gray-800 text-secondary rounded-full px-3 py-1 text-xs">
                {categoryLabels[course.category || ''] || course.category || 'Общее'}
              </div>
              
              <div className="flex items-center text-xs text-secondary bg-gray-800 rounded-full px-3 py-1">
                <FiStar className="mr-1" />
                <span>
                  {course.level ? levelLabels[course.level] || course.level : 'Начинающий'}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-secondary bg-gray-800 rounded-full px-3 py-1">
                <FiClock className="mr-1" />
                <span>{course.duration ? `${course.duration} мин.` : 'Курс'}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-secondary text-sm line-clamp-3">
              {course.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
} 