'use client'

import Link from 'next/link'
import { FiGithub, FiTwitter, FiYoutube, FiInstagram } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-background-lighter pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                TrueSpace
              </span>
            </Link>
            <p className="text-secondary text-sm">
              Образовательная платформа для эффективного обучения с видео-уроками и практическими заданиями.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: <FiTwitter />, href: "#" },
                { icon: <FiYoutube />, href: "#" },
                { icon: <FiInstagram />, href: "#" },
                { icon: <FiGithub />, href: "#" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="text-secondary hover:text-accent transition-colors duration-300"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              {[
                { name: 'Главная', href: '/' },
                { name: 'Курсы', href: '/courses' },
                { name: 'О нас', href: '/about' },
                { name: 'Контакты', href: '/contact' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-secondary hover:text-accent transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Аккаунт</h3>
            <ul className="space-y-2">
              {[
                { name: 'Регистрация', href: '/auth/register' },
                { name: 'Вход', href: '/auth/login' },
                { name: 'Профиль', href: '/profile' },
                { name: 'Настройки', href: '/profile/settings' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-secondary hover:text-accent transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Правовая информация</h3>
            <ul className="space-y-2">
              {[
                { name: 'Условия использования', href: '/terms' },
                { name: 'Политика конфиденциальности', href: '/privacy' },
                { name: 'Политика cookie', href: '/cookies' },
                { name: 'Помощь', href: '/help' }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-secondary hover:text-accent transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-secondary">
          <p>© {currentYear} TrueSpace. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
} 