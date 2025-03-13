import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Lesson from '@/models/Lesson'
import PromoCode from '@/models/PromoCode'
import User from '@/models/User'

// GET request to check if user has access to a lesson
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация', hasAccess: false },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const { id } = params
    
    // Find lesson
    const lesson = await Lesson.findById(id).lean()
    
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: 'Урок не найден', hasAccess: false },
        { status: 404 }
      )
    }
    
    // If lesson doesn't require promo code, grant access
    if (!lesson.requiresPromoCode) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
      })
    }
    
    // Check if user is admin
    if (session.user.role === 'admin') {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        reason: 'admin',
      })
    }
    
    // Find user
    const user = await User.findById(session.user.id).lean()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден', hasAccess: false },
        { status: 404 }
      )
    }
    
    // Check if the user has used a promo code for this lesson
    const promoCode = await PromoCode.findOne({
      $or: [
        { lessonId: lesson._id },
        { courseId: lesson.course },
      ],
      'usedBy.userId': session.user.id,
      active: true,
    }).lean()
    
    if (promoCode) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        promoCode: {
          code: promoCode.code,
          id: promoCode._id,
        },
      })
    }
    
    return NextResponse.json({
      success: true,
      hasAccess: false,
    })
  } catch (error) {
    console.error('Error checking lesson access:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка при проверке доступа к уроку', hasAccess: false },
      { status: 500 }
    )
  }
} 