const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir la IP de tu red local en desarrollo (para probar la web en tu celular sin bloqueos de origen)
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.1.102',
  ],

  // 1. Optimización de Imágenes Vercel (Formatos WebP y AVIF comprimidos)
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // 2. Cabeceras HTTP de Seguridad (Pentesting & Hardening Estándar de la Industria)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Previene ataques de Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Bloquea sniffing de tipos MIME
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Protección contra Cross-Site Scripting
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },
};

const intlConfig = withNextIntl(nextConfig);

// Solo activar la instrumentación pesada de Sentry en producción para ahorrar RAM y evitar OOM en local
if (process.env.NODE_ENV === "production" && process.env.SENTRY_AUTH_TOKEN) {
  const { withSentryConfig } = require("@sentry/nextjs");
  module.exports = withSentryConfig(intlConfig, {
    org: "alonsoriosdev-yb",
    project: "servers_sentry_status_vercel",
    silent: true,
    telemetry: false,
    sourcemaps: {
      disable: !process.env.SENTRY_AUTH_TOKEN,
    },
    widenClientFileUpload: false,
    webpack: {
      automaticVercelMonitors: false,
      treeshake: {
        removeDebugLogging: true,
      },
    },
  });
} else {
  module.exports = intlConfig;
}
