/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [''],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Игнорирование ошибок типов в процессе сборки
    // Это позволит сделать успешный деплой даже если есть ошибки типов
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 