import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dbConnect from '@/lib/dbConnect'
import Course from '@/models/Course'
import CourseDetails from '@/components/CourseDetails'

interface CoursePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  await dbConnect()
  const course = await Course.findOne({ slug: params.slug }).lean()
  
  if (!course) {
    return {
      title: 'Курс не найден | TrueSpace',
      description: 'Запрашиваемый курс не найден на нашей платформе.'
    }
  }
  
  return {
    title: `${course.title} | TrueSpace`,
    description: course.description || 'Изучите этот курс на платформе TrueSpace',
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  await dbConnect()
  const course = await Course.findOne({ slug: params.slug })
    .populate('author', 'name image')
    .lean()
  
  if (!course) {
    notFound()
  }
  
  return (
    <main>
      <CourseDetails course={JSON.parse(JSON.stringify(course))} />
    </main>
  )
} 