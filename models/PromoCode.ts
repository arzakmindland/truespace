import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IPromoCode extends Document {
  code: string
  courseId?: mongoose.Types.ObjectId
  lessonId?: mongoose.Types.ObjectId
  description: string
  expiresAt?: Date
  maxUses?: number
  currentUses: number
  active: boolean
  usedBy: {
    userId: mongoose.Types.ObjectId
    usedAt: Date
  }[]
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: [true, 'Пожалуйста, укажите код промокода'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    description: {
      type: String,
      required: [true, 'Пожалуйста, укажите описание промокода'],
    },
    expiresAt: {
      type: Date,
    },
    maxUses: {
      type: Number,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    usedBy: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      usedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

// Middleware to check if the promo code has expired or reached max uses
PromoCodeSchema.pre('save', function (next) {
  // Check if expired
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.active = false
  }
  
  // Check if max uses reached
  if (this.maxUses && this.currentUses >= this.maxUses) {
    this.active = false
  }
  
  next()
})

// Create index for code for efficient lookups
PromoCodeSchema.index({ code: 1 })

const PromoCode: Model<IPromoCode> = mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema)

export default PromoCode 