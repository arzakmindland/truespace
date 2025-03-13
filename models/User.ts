import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  name: string
  email: string
  password: string
  image?: string
  role: 'user' | 'admin'
  favorites?: mongoose.Types.ObjectId[]
  enrolledCourses?: {
    course: mongoose.Types.ObjectId
    progress: number
    lastAccessed?: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Пожалуйста, введите корректный email'],
    },
    password: {
      type: String,
      required: [true, 'Пароль обязателен'],
      minlength: [6, 'Пароль должен содержать минимум 6 символов'],
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    favorites: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Course' 
    }],
    enrolledCourses: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        lastAccessed: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
)

// Middleware для хеширования пароля перед сохранением
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Метод для сравнения паролей
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Проверяем, если модель уже существует, чтобы избежать переопределения
const User = (mongoose.models.User as Model<IUserDocument>) || 
             mongoose.model<IUserDocument>('User', UserSchema)

export default User 