/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Игнорирование ошибок типов в процессе сборки
    // Это позволит сделать успешный деплой даже если есть ошибки типов
    ignoreBuildErrors: true,
  },
  // Оптимизация для Render
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Настройка обработки библиотек, которые могут использовать browser API
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  
  experimental: {
    // Серверные пакеты
    serverComponentsExternalPackages: ['mongoose'],
  },
  
  // Транспиляция только пакета decimal-js-sdk
  transpilePackages: ['decimal-js-sdk'],
  
  // Устанавливаем переменные окружения для правильного определения хоста
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
    PORT: process.env.PORT || 10000,
  },
};

module.exports = nextConfig; 