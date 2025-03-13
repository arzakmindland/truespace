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

// GET request to fetch all published courses
export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Filter parameters
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    
    // Build query
    const query: any = { published: true }
    
    if (category) query.category = category
    if (level) query.level = level
    if (featured === 'true') query.featured = true
    
    // Search functionality
    if (search) {
      query.$text = { $search: search }
    }
    
    // Fetch courses
    const totalCourses = await Course.countDocuments(query)
    const courses = await Course.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        total: totalCourses,
        page,
        limit,
        pages: Math.ceil(totalCourses / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении курсов' },
      { status: 500 }
    )
  }
}

// POST request to create a new course (admin only)
export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Доступ запрещен. Требуются права администратора' },
        { status: 403 }
      )
    }
    
    await dbConnect()
    
    // Parse and validate request body
    const body = await req.json()
    const validation = createCourseSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      )
    }
    
    const courseData = validation.data
    
    // Check if course with the same slug already exists
    const existingCourse = await Course.findOne({ slug: courseData.slug })
    if (existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Курс с таким slug уже существует' },
        { status: 409 }
      )
    }
    
    // Create course
    const course = await Course.create({
      ...courseData,
      createdBy: session.user.id,
    })
    
    return NextResponse.json(
      { success: true, course },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при создании курса' },
      { status: 500 }
    )
  }
} 