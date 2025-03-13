'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiUser, FiLogOut, FiBookmark, FiSearch } from 'react-icons/fi'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navLinks = [
    { name: 'Главная', href: '/' },
    { name: 'Курсы', href: '/courses' },
    { name: 'О нас', href: '/about' },
  ]
  
  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/90 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                TrueSpace
              </span>
            </motion.div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-accent ${
                  pathname === link.href ? 'text-accent' : 'text-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/search" 
                  className="p-2 rounded-full hover:bg-background-light transition-colors duration-300"
                >
                  <FiSearch className="w-5 h-5" />
                </Link>
                <Link 
                  href="/favorites" 
                  className="p-2 rounded-full hover:bg-background-light transition-colors duration-300"
                >
                  <FiBookmark className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-background-lighter border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-background-light">
                      Профиль
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-background-light"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-secondary hover:text-white transition-colors duration-300">
                  Войти
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Регистрация
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-white focus:outline-none"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background-lighter border-t border-gray-800"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'text-accent bg-background-light'
                      : 'text-secondary hover:bg-background-light hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-700">
                {session ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-background-light hover:text-white"
                    >
                      <FiUser className="mr-3 h-5 w-5" />
                      Профиль
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-background-light hover:text-white"
                    >
                      <FiBookmark className="mr-3 h-5 w-5" />
                      Избранное
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-background-light hover:text-white"
                    >
                      <FiLogOut className="mr-3 h-5 w-5" />
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-background-light hover:text-white"
                    >
                      Войти
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-3 py-2 mt-1 rounded-md text-base font-medium bg-accent text-white hover:bg-accent-light"
                    >
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
} 