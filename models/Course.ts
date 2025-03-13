import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ILesson {
  title: string
  description: string
  type: 'video' | 'text' | 'quiz'
  content: string
  duration?: number
  order: number
}

export interface ICourse {
  title: string
  slug: string
  description: string
  thumbnail?: string
  category?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  duration?: number
  featured?: boolean
  tags?: string[]
  requirements?: string[]
  lessons: ILesson[]
  createdAt: Date
  updatedAt: Date
}

export interface ICourseDocument extends ICourse, Document {}

const LessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: [true, 'Заголовок урока обязателен'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Описание урока обязательно'],
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz'],
    default: 'video',
  },
  content: {
    type: String,
    required: [true, 'Содержимое урока обязательно'],
  },
  duration: {
    type: Number,
  },
  order: {
    type: Number,
    required: true,
  },
})

const CourseSchema = new Schema<ICourseDocument>(
  {
    title: {
      type: String,
      required: [true, 'Название курса обязательно'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug обязателен'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Описание курса обязательно'],
    },
    thumbnail: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        'programming',
        'design',
        'business',
        'marketing',
        'personal-development',
        'other',
      ],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    duration: {
      type: Number,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    requirements: [String],
    lessons: [LessonSchema],
  },
  { timestamps: true }
)

// Create indexes for search
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' })

// Automatically update the course duration based on lesson durations
CourseSchema.pre('save', function (next) {
  if (this.lessons && this.lessons.length > 0) {
    const totalDuration = this.lessons.reduce((sum, lesson) => {
      return sum + (lesson.duration || 0)
    }, 0)
    this.duration = totalDuration
  }
  next()
})

const Course = (mongoose.models.Course as Model<ICourseDocument>) || 
               mongoose.model<ICourseDocument>('Course', CourseSchema)

export default Course 