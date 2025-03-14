import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import FavoritesContent from '@/components/FavoritesContent'
import ClientWrapper from '@/components/ClientWrapper'

export const metadata: Metadata = {
  title: 'Избранное | TrueSpace',
  description: 'Просмотр и управление избранными курсами на платформе TrueSpace.',
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/favorites')
  }
  
  return (
    <ClientWrapper>
      <FavoritesContent />
    </ClientWrapper>
  )
} 