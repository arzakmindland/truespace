import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import { z } from 'zod'

// Validation schema for updating a lesson
const updateLessonSchema = z.object({
  title: z.string().min(1, 'Название урока обязательно').optional(),
  description: z.string().min(1, 'Описание урока обязательно').optional(),
  content: z.string().optional(),
  duration: z.number().min(1, 'Продолжительность урока обязательна').optional(),
  youtubeId: z.string().min(1, 'YouTube ID видео обязателен').optional(),
  order: z.number().optional(),
  requiresPromoCode: z.boolean().optional(),
  published: z.boolean().optional(),
})

// GET request to fetch a single lesson by id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const { id } = params
    
    // Find lesson by id
    const lesson = await Lesson.findById(id)
      .populate('course', 'title slug')
      .lean()
    
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Урок не найден' },
        { status: 404 }
      )
    }
    
    // Check if user can access this lesson
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin'
    
    // If lesson is not published and user is not admin, deny access
    if (!lesson.published && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Урок недоступен' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({
      success: true,
      lesson,
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении урока' },
      { status: 500 }
    )
  }
}

// PATCH request to update a lesson (admin only)
export async function PATCH(
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
    
    // Find lesson
    const lesson = await Lesson.findById(id)
    
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Урок не найден' },
        { status: 404 }
      )
    }
    
    // Parse and validate request body
    const body = await req.json()
    const validation = updateLessonSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      )
    }
    
    const updateData = validation.data
    
    // If title is updated, regenerate slug
    if (updateData.title) {
      const slug = updateData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
      
      // @ts-ignore - добавляем slug в объект updateData
      updateData.slug = slug
    }
    
    // Update lesson
    Object.keys(updateData).forEach((key) => {
      // @ts-ignore
      lesson[key] = updateData[key]
    })
    
    await lesson.save()
    
    return NextResponse.json({
      success: true,
      lesson,
    })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении урока' },
      { status: 500 }
    )
  }
}

// DELETE request to delete a lesson (admin only)
export async function DELETE(
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
    
    // Find lesson
    const lesson = await Lesson.findById(id)
    
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Урок не найден' },
        { status: 404 }
      )
    }
    
    // Delete lesson
    await lesson.deleteOne()
    
    // Update parent course
    await Course.findByIdAndUpdate(lesson.course, {
      $pull: { lessons: id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Урок успешно удален',
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении урока' },
      { status: 500 }
    )
  }
} 