'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FiUser, FiVideo, FiStar, FiSearch, FiShield } from 'react-icons/fi'
import { Suspense } from 'react'

// Main content component
function HomeContent() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 md:px-8 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            TrueSpace
          </h1>
          <p className="text-xl md:text-2xl text-secondary mb-8">
            Образовательная платформа с видео-уроками для эффективного обучения
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary">
              Начать обучение
            </Link>
            <Link href="/courses" className="btn-secondary">
              Просмотреть курсы
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-background-lighter">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Почему TrueSpace?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FiVideo className="w-8 h-8 text-accent" />,
                title: "Качественные видео-уроки",
                description: "Доступ к эксклюзивному образовательному контенту от профессионалов своего дела"
              },
              {
                icon: <FiUser className="w-8 h-8 text-accent" />,
                title: "Личный кабинет",
                description: "Отслеживайте прогресс обучения и сохраняйте понравившиеся курсы"
              },
              {
                icon: <FiStar className="w-8 h-8 text-accent" />,
                title: "Избранные материалы",
                description: "Создавайте коллекцию любимых уроков и возвращайтесь к ним в любое время"
              },
              {
                icon: <FiSearch className="w-8 h-8 text-accent" />,
                title: "Умный поиск",
                description: "Быстро находите нужные материалы с помощью фильтров и категорий"
              },
              {
                icon: <FiShield className="w-8 h-8 text-accent" />,
                title: "Безопасный доступ",
                description: "Эксклюзивный доступ к урокам через систему промокодов"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:bg-background-light"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-background to-background-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Готовы начать обучение?</h2>
          <p className="text-xl text-secondary mb-8">
            Присоединяйтесь к нашему сообществу и откройте для себя новые знания и навыки
          </p>
          <Link href="/auth/register" className="btn-primary px-8 py-3 text-lg">
            Зарегистрироваться
          </Link>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}

// Home page component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
} 