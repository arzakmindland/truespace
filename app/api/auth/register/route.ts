import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { z } from 'zod'

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
})

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body = await req.json()

    // Validate input data
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Пользователь с таким email уже существует' },
        { status: 409 }
      )
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    })

    // Return sanitized user data
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Ошибка регистрации' },
      { status: 500 }
    )
  }
} 