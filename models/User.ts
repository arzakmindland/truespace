import mongoose, { Document, Model, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  image?: string
  role: 'user' | 'admin'
  favorites: mongoose.Types.ObjectId[]
  savedCourses: mongoose.Types.ObjectId[]
  watchHistory: {
    lesson: mongoose.Types.ObjectId
    progress: number
    lastWatched: Date
  }[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
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
      ref: 'Lesson',
    }],
    savedCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    watchHistory: [{
      lesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
      },
      progress: {
        type: Number,
        default: 0,
      },
      lastWatched: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { timestamps: true }
)

// Hash password before saving
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

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User 