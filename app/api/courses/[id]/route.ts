import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Course from '@/models/Course'
import Lesson from '@/models/Lesson'
import { z } from 'zod'

// Validation schema for updating a course
const updateCourseSchema = z.object({
  title: z.string().min(1, 'Название курса обязательно').optional(),
  description: z.string().min(1, 'Описание курса обязательно').optional(),
  thumbnail: z.string().url('Требуется действительный URL миниатюры').optional(),
  category: z.string().min(1, 'Категория курса обязательна').optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.number().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
})

// GET request to fetch a single course by id (can be MongoDB _id or slug)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const { id } = params
    
    // Find course by either _id or slug (checking if it's a valid MongoDB ObjectId)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    const query = isObjectId 
      ? { _id: id } 
      : { slug: id };
    
    // Find course
    const course = await Course.findOne(query)
      .populate('createdBy', 'name')
      .lean()
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Курс не найден' },
        { status: 404 }
      )
    }
    
    // Find lessons for this course
    const lessons = await Lesson.find({ 
      course: course._id,
      published: true 
    })
      .select('title slug description duration order requiresPromoCode youtubeId')
      .sort({ order: 1 })
      .lean()
    
    return NextResponse.json({
      success: true,
      course: {
        ...course,
        lessons,
      },
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении курса' },
      { status: 500 }
    )
  }
}

// PATCH request to update a course (admin only)
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
    
    // Find course by either _id or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    const query = isObjectId 
      ? { _id: id } 
      : { slug: id };
    
    // Find course
    const course = await Course.findOne(query)
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Курс не найден' },
        { status: 404 }
      )
    }
    
    // Parse and validate request body
    const body = await req.json()
    const validation = updateCourseSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      )
    }
    
    const updateData = validation.data
    
    // Update course
    Object.keys(updateData).forEach((key) => {
      // @ts-ignore
      course[key] = updateData[key]
    })
    
    await course.save()
    
    return NextResponse.json({
      success: true,
      course,
    })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении курса' },
      { status: 500 }
    )
  }
}

// DELETE request to delete a course (admin only)
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
    
    // Find course by either _id or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    const query = isObjectId 
      ? { _id: id } 
      : { slug: id };
    
    // Find course
    const course = await Course.findOne(query)
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Курс не найден' },
        { status: 404 }
      )
    }
    
    // Delete all lessons associated with this course
    await Lesson.deleteMany({ course: course._id })
    
    // Delete course
    await course.deleteOne()
    
    return NextResponse.json({
      success: true,
      message: 'Курс и связанные уроки успешно удалены',
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении курса' },
      { status: 500 }
    )
  }
} 