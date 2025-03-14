import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Course from '@/models/Course'

// GET /api/user/courses - получить список курсов пользователя
export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }
    
    // Получаем список ID курсов пользователя
    const enrolledCourseIds = user.enrolledCourses || []
    
    // Если список пуст, возвращаем пустой массив
    if (enrolledCourseIds.length === 0) {
      return NextResponse.json({ courses: [] })
    }
    
    // Получаем информацию о курсах
    const courses = await Course.find({
      _id: { $in: enrolledCourseIds }
    }).select('title description thumbnail slug price level tags progress')
    
    // Добавляем информацию о прогрессе для каждого курса
    const coursesWithProgress = courses.map(course => {
      const courseObj = course.toObject()
      
      // Находим прогресс пользователя для этого курса
      const courseProgress = user.progress?.find(
        p => p.courseId.toString() === course._id.toString()
      )
      
      if (courseProgress) {
        courseObj.progress = courseProgress
      } else {
        courseObj.progress = { completed: false, completedLessons: [] }
      }
      
      return courseObj
    })
    
    return NextResponse.json({ courses: coursesWithProgress })
  } catch (error) {
    console.error('Ошибка при получении курсов пользователя:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 