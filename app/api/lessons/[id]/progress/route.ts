import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import Lesson from '@/models/Lesson'
import { z } from 'zod'

// Validation schema for updating progress
const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  lastWatched: z.string().datetime(),
})

// GET request to fetch a user's progress on a lesson
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const { id } = params
    
    // Find user and their progress
    const user = await User.findById(session.user.id).lean()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      )
    }
    
    // Find lesson progress in watch history
    const lessonProgress = user.watchHistory?.find(
      (item) => item.lesson.toString() === id
    )
    
    return NextResponse.json({
      success: true,
      progress: lessonProgress ? lessonProgress.progress : 0,
      lastWatched: lessonProgress ? lessonProgress.lastWatched : null,
    })
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении прогресса урока' },
      { status: 500 }
    )
  }
}

// POST request to update a user's progress on a lesson
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const { id } = params
    
    // Validate the lesson exists
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Урок не найден' },
        { status: 404 }
      )
    }
    
    // Parse and validate request body
    const body = await req.json()
    const validation = updateProgressSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      )
    }
    
    const { progress, lastWatched } = validation.data
    
    // Find user
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      )
    }
    
    // Find if lesson already exists in watch history
    const existingProgressIndex = user.watchHistory.findIndex(
      (item) => item.lesson.toString() === id
    )
    
    if (existingProgressIndex !== -1) {
      // Update existing progress
      user.watchHistory[existingProgressIndex].progress = progress
      user.watchHistory[existingProgressIndex].lastWatched = new Date(lastWatched)
    } else {
      // Add new progress entry
      user.watchHistory.push({
        lesson: id as any,
        progress,
        lastWatched: new Date(lastWatched),
      })
    }
    
    await user.save()
    
    return NextResponse.json({
      success: true,
      message: 'Прогресс урока успешно обновлен',
      progress,
      lastWatched,
    })
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении прогресса урока' },
      { status: 500 }
    )
  }
} 