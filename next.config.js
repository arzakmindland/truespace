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
}

module.exports = nextConfig 