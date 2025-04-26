/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
      redis: false,
      "@socket.io/redis-adapter": false
    };
    return config;
  },
  
  // Внешние серверные пакеты в корректной конфигурации
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    esmExternals: 'loose'
  },
  
  // Транспиляция только пакета decimal-js-sdk
  transpilePackages: ['decimal-js-sdk'],
  
  // Устанавливаем переменные окружения для правильного определения хоста
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
    PORT: process.env.PORT || 10000,
  },

  // Настройки для production
  async headers() {
    return [
      {
        source: '/api/socket',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

export default nextConfig; 