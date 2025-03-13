import mongoose, { Document, Model, Schema } from 'mongoose'

export interface ILesson extends Document {
  title: string
  slug: string
  description: string
  course: mongoose.Types.ObjectId
  youtubeId: string
  duration: number // in seconds
  order: number
  published: boolean
  resources: {
    title: string
    type: 'pdf' | 'link' | 'file'
    url: string
  }[]
  requiresPromoCode: boolean
  createdAt: Date
  updatedAt: Date
}

const LessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, 'Пожалуйста, укажите название урока'],
      trim: true,
      maxlength: [100, 'Название не может превышать 100 символов'],
    },
    slug: {
      type: String,
      required: [true, 'Пожалуйста, укажите slug урока'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание урока'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    youtubeId: {
      type: String,
      required: [true, 'Пожалуйста, укажите ID видео на YouTube'],
    },
    duration: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      required: [true, 'Пожалуйста, укажите порядок урока'],
    },
    published: {
      type: Boolean,
      default: false,
    },
    resources: [{
      title: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['pdf', 'link', 'file'],
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    }],
    requiresPromoCode: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
)

// Create a compound index for course and order for efficient sorting
LessonSchema.index({ course: 1, order: 1 })

const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema)

export default Lesson 