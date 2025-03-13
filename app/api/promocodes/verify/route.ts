import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import PromoCode from '@/models/PromoCode'
import User from '@/models/User'
import { z } from 'zod'

// Define validation schema
const verifyPromoCodeSchema = z.object({
  code: z.string().min(1, 'Промокод не может быть пустым'),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Для проверки промокода необходима авторизация' },
        { status: 401 }
      )
    }

    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await req.json()

    // Validate input data
    const validation = verifyPromoCodeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      )
    }

    const { code, courseId, lessonId } = validation.data

    // Find promo code
    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() })

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Промокод недействителен' },
        { status: 404 }
      )
    }

    // Check if promo code is active
    if (!promoCode.active) {
      return NextResponse.json(
        { success: false, message: 'Промокод неактивен' },
        { status: 400 }
      )
    }

    // Check if promo code is expired
    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      promoCode.active = false
      await promoCode.save()
      
      return NextResponse.json(
        { success: false, message: 'Срок действия промокода истек' },
        { status: 400 }
      )
    }

    // Check if promo code reached max uses
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      promoCode.active = false
      await promoCode.save()
      
      return NextResponse.json(
        { success: false, message: 'Промокод достиг максимального количества использований' },
        { status: 400 }
      )
    }

    // Check if user already used this promo code
    const alreadyUsed = promoCode.usedBy.some(
      (entry) => entry.userId.toString() === session.user.id
    )

    if (alreadyUsed) {
      return NextResponse.json(
        { success: false, message: 'Вы уже использовали этот промокод' },
        { status: 400 }
      )
    }

    // Check if promo code is valid for the specified course or lesson
    if (courseId && promoCode.courseId && promoCode.courseId.toString() !== courseId) {
      return NextResponse.json(
        { success: false, message: 'Промокод недействителен для данного курса' },
        { status: 400 }
      )
    }

    if (lessonId && promoCode.lessonId && promoCode.lessonId.toString() !== lessonId) {
      return NextResponse.json(
        { success: false, message: 'Промокод недействителен для данного урока' },
        { status: 400 }
      )
    }

    // Update promo code usage
    promoCode.currentUses += 1
    promoCode.usedBy.push({
      userId: session.user.id as any,
      usedAt: new Date(),
    })

    // Save promo code updates
    await promoCode.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Промокод успешно применен',
        promoCode: {
          id: promoCode._id,
          code: promoCode.code,
          courseId: promoCode.courseId,
          lessonId: promoCode.lessonId,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Promo code verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка проверки промокода' },
      { status: 500 }
    )
  }
} 