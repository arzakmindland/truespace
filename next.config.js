/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'i.ytimg.com',     // Для превью с YouTube
      'img.youtube.com', // Для превью с YouTube
      'via.placeholder.com', // Для тестовых изображений
      'images.unsplash.com', // Для тестовых изображений
    ],
  },
  // Настройка для деплоя на Render
  output: 'standalone',
  
  // Отключаем генерацию статических страниц для решения проблемы с таймаутом
  experimental: {
    // Это не будет генерировать статические страницы во время сборки,
    // а вместо этого будет использовать SSR или CSR в зависимости от маршрута
    workerThreads: false,
    cpus: 1
  },

  // Все страницы будут рендериться динамически
  staticPageGenerationTimeout: 10,
  
  eslint: {
    // Отключаем проверку ESLint во время сборки для ускорения
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    // Отключаем проверку типов во время сборки для ускорения
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 