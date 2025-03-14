import { Metadata } from 'next'
import ClientWrapper from '@/components/ClientWrapper'
import CoursesContent from '@/components/CoursesContent'

export const metadata: Metadata = {
  title: 'Курсы | TrueSpace',
  description: 'Изучайте новые навыки с нашими онлайн-курсами. Широкий выбор тем от программирования до личностного развития.',
}

export default function CoursesPage() {
  return (
    <ClientWrapper>
      <CoursesContent />
    </ClientWrapper>
  )
} 