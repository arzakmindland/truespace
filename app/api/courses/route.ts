import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Course from '@/models/Course'
import { z } from 'zod'

// Validation schema for creating a course
const createCourseSchema = z.object({
  title: z.string().min(1, 'Название курса обязательно'),
  slug: z.string().min(1, 'Slug курса обязателен'),
  description: z.string().min(1, 'Описание курса обязательно'),
  thumbnail: z.string().url('Требуется действительный URL миниатюры'),
  category: z.string().min(1, 'Категория курса обязательна'),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
})

// GET /api/courses - Получить список курсов с фильтрацией и сортировкой
export async function GET(req: NextRequest) {
  try {
    // Подключаемся к базе данных
    await dbConnect()

    // Получаем параметры запроса
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const level = searchParams.get('level') || ''
    const featured = searchParams.get('featured') || ''
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')

    // Создаем объект запроса
    const query: any = {}

    // Добавляем поиск по тексту (по заголовку, описанию и тегам)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
    }

    // Фильтрация по категории
    if (category) {
      query.category = category
    }

    // Фильтрация по уровню сложности
    if (level) {
      query.level = level
    }

    // Фильтрация по featured
    if (featured === 'true') {
      query.featured = true
    }

    // Определяем сортировку
    let sortOption = {}
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 }
        break
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'name-asc':
        sortOption = { title: 1 }
        break
      case 'name-desc':
        sortOption = { title: -1 }
        break
      default:
        sortOption = { createdAt: -1 }
    }

    // Выполняем запрос с пагинацией
    const skip = (page - 1) * limit
    
    // Получаем общее количество курсов
    const totalCount = await Course.countDocuments(query)
    
    // Получаем курсы с применением фильтров, сортировки и пагинации
    const courses = await Course.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select(
        'title slug description thumbnail category level duration featured tags createdAt'
      )
    
    // Формируем ответ
    return NextResponse.json({
      courses,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Создать новый курс (только для администраторов)
export async function POST(req: NextRequest) {
  try {
    // Здесь должна быть проверка на роль администратора
    // ...

    // Получаем данные из тела запроса
    const body = await req.json()
    const {
      title,
      slug,
      description,
      thumbnail,
      category,
      level,
      duration,
      featured,
      tags,
      requirements,
    } = body

    // Базовая валидация
    if (!title || !slug || !description) {
      return NextResponse.json(
        { error: 'Название, slug и описание обязательны' },
        { status: 400 }
      )
    }

    // Подключаемся к базе данных
    await dbConnect()

    // Проверяем уникальность slug
    const existingCourse = await Course.findOne({ slug })
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Курс с таким slug уже существует' },
        { status: 400 }
      )
    }

    // Создаем новый курс
    const newCourse = new Course({
      title,
      slug,
      description,
      thumbnail,
      category,
      level,
      duration,
      featured: featured || false,
      tags: tags || [],
      requirements: requirements || [],
      lessons: [],
    })

    // Сохраняем курс
    await newCourse.save()

    return NextResponse.json(
      { message: 'Курс успешно создан', course: newCourse },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 