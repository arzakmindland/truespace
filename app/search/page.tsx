import { Metadata } from 'next'
import SearchContent from '@/components/SearchContent'

export const metadata: Metadata = {
  title: 'Поиск курсов | TrueSpace',
  description: 'Найдите идеальный курс для обучения. Используйте фильтры по категориям и уровням сложности.',
}

export default function SearchPage() {
  return (
    <main>
      <SearchContent />
    </main>
  )
} 