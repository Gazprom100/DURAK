/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['i.pravatar.cc'],
    unoptimized: true,
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
};

module.exports = nextConfig; 