import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ESLint más estricto - NO ignorar errores en build
  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de imágenes más amplia para un juego
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimización para assets de juego
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  output: 'standalone',
  transpilePackages: ['motion'],

  // Configuración experimental para mejor rendimiento
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    // Optimizaciones para assets de juego
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
      type: 'asset/resource',
      generator: {
        filename: 'assets/[hash][ext]',
      },
    });

    return config;
  },

  // Headers de seguridad básicos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
