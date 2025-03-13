import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Course from '@/models/Course'
import Lesson from '@/models/Lesson'
import { z } from 'zod'

// Validation schema for creating a lesson
const createLessonSchema = z.object({
  title: z.string().min(1, 'Название урока обязательно'),
  description: z.string().min(1, 'Описание урока обязательно'),
  content: z.string().optional(),
  duration: z.number().min(1, 'Продолжительность урока обязательна'),
  youtubeId: z.string().min(1, 'YouTube ID видео обязателен'),
  order: z.number().optional(),
  requiresPromoCode: z.boolean().optional(),
  published: z.boolean().optional(),
})

// GET request to fetch all lessons for a specific course
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const { id } = params
    
    // Check if course exists
    const course = await Course.findById(id)
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Курс не найден' },
        { status: 404 }
      )
    }
    
    // Get user session to determine if admin
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin'
    
    // Build query - admins can see all lessons, regular users only published ones
    const query = { course: id }
    if (!isAdmin) {
      // @ts-ignore
      query.published = true
    }
    
    // Find lessons for this course
    const lessons = await Lesson.find(query)
      .sort({ order: 1 })
      .lean()
    
    return NextResponse.json({
      success: true,
      lessons,
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении уроков' },
      { status: 500 }
    )
  }
}

// POST request to create a new lesson (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params
    
    // Check if course exists
    const course = await Course.findById(id)
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Курс не найден' },
        { status: 404 }
      )
    }
    
    // Parse and validate request body
    const body = await req.json()
    const validation = createLessonSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      )
    }
    
    const lessonData = validation.data
    
    // Find highest order if not provided
    if (!lessonData.order) {
      const highestOrderLesson = await Lesson.findOne({ course: id })
        .sort({ order: -1 })
        .limit(1)
        .select('order')
      
      lessonData.order = highestOrderLesson ? highestOrderLesson.order + 1 : 1
    }
    
    // Generate slug from title
    const slug = lessonData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
    
    // Create new lesson
    const newLesson = new Lesson({
      ...lessonData,
      slug,
      course: id,
    })
    
    await newLesson.save()
    
    return NextResponse.json({
      success: true,
      lesson: newLesson,
    })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при создании урока' },
      { status: 500 }
    )
  }
} 