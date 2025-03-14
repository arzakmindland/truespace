import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ProfileContent from '@/components/ProfileContent'
import ClientWrapper from '@/components/ClientWrapper'

export const metadata: Metadata = {
  title: 'Мой профиль | TrueSpace',
  description: 'Управляйте своим профилем, просматривайте записанные курсы и отслеживайте прогресс обучения.',
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login?callbackUrl=/profile')
  }
  
  return (
    <ClientWrapper>
      <ProfileContent user={session.user} />
    </ClientWrapper>
  )
} 