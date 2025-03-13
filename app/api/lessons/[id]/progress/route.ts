import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Lesson from '@/models/Lesson'
import Course from '@/models/Course'
import { z } from 'zod'
import mongoose from 'mongoose'

// Validation schema for updating progress
const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  courseId: z.string(), // courseId is required to update the progress
  lastAccessed: z.string().datetime().optional(),
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
        { error: 'Требуется авторизация' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const { id } = params
    
    // First, find the lesson to get its courseId
    const lesson = await Lesson.findById(id).lean()
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Урок не найден' },
        { status: 404 }
      )
    }
    
    // Find user
    const user = await User.findById(session.user.id).lean()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }
    
    // Find course in user's enrolled courses
    const enrolledCourse = user.enrolledCourses?.find(
      entry => entry.course.toString() === lesson.course.toString()
    )
    
    // If the user hasn't enrolled in this course, return 0 progress
    if (!enrolledCourse) {
      return NextResponse.json({
        progress: 0,
        lastAccessed: null
      })
    }
    
    return NextResponse.json({
      progress: enrolledCourse.progress,
      lastAccessed: enrolledCourse.lastAccessed || null
    })
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении прогресса урока' },
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
        { error: 'Требуется авторизация' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const { id } = params
    
    // Validate the lesson exists
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return NextResponse.json(
        { error: 'Урок не найден' },
        { status: 404 }
      )
    }
    
    // Parse and validate request body
    const body = await req.json()
    const validation = updateProgressSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: validation.error.errors },
        { status: 400 }
      )
    }
    
    const { progress, courseId, lastAccessed } = validation.data
    
    // Validate that the lesson belongs to the specified course
    if (lesson.course.toString() !== courseId) {
      return NextResponse.json(
        { error: 'Урок не принадлежит указанному курсу' },
        { status: 400 }
      )
    }
    
    // Find user
    const user = await User.findById(session.user.id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }
    
    // Initialize enrolledCourses array if it doesn't exist
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
    
    // Check if the user is already enrolled in the course
    const courseIndex = user.enrolledCourses.findIndex(
      entry => entry.course.toString() === courseId
    );
    
    if (courseIndex === -1) {
      // User is not enrolled in this course, add it
      user.enrolledCourses.push({
        course: new mongoose.Types.ObjectId(courseId),
        progress: progress,
        lastAccessed: lastAccessed ? new Date(lastAccessed) : new Date()
      });
    } else {
      // Update existing enrollment
      user.enrolledCourses[courseIndex].progress = progress;
      user.enrolledCourses[courseIndex].lastAccessed = lastAccessed 
        ? new Date(lastAccessed) 
        : new Date();
    }
    
    await user.save()
    
    return NextResponse.json({
      message: 'Прогресс урока успешно обновлен',
      progress,
      lastAccessed: lastAccessed || new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении прогресса урока' },
      { status: 500 }
    )
  }
} 