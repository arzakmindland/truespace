import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ICourse extends Document {
  title: string
  slug: string
  description: string
  thumbnail: string
  category: string
  tags: string[]
  lessons: mongoose.Types.ObjectId[]
  requirements: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  published: boolean
  featured: boolean
  createdBy: mongoose.Types.ObjectId
  students: mongoose.Types.ObjectId[]
  rating: {
    average: number
    count: number
  }
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название курса'],
      trim: true,
      maxlength: [100, 'Название не может превышать 100 символов'],
    },
    slug: {
      type: String,
      required: [true, 'Пожалуйста, укажите slug курса'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание курса'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Пожалуйста, укажите миниатюру курса'],
    },
    category: {
      type: String,
      required: [true, 'Пожалуйста, укажите категорию курса'],
    },
    tags: [{
      type: String,
    }],
    lessons: [{
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    }],
    requirements: [{
      type: String,
    }],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
)

// Create a text index for search
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' })

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

export default Course 