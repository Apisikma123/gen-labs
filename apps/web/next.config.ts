import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  transpilePackages: ["@genlab/simulation-core", "@genlab/simulation-types"],
  experimental: {
    optimizePackageImports: ["lucide-react", "animejs", "katex", "motion", "motion/react", "three"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  allowedDevOrigins: [
    '*.trycloudflare.com',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' http://127.0.0.1:8000; frame-ancestors 'self';",
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:all*(woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(favicon.ico|favicon.svg|apple-touch-icon.png|site.webmanifest)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // ── P0 & P5: TRUE PRODUCTION BACKEND ROUTING (Next.js -> Laravel -> MySQL) ──
        {
          source: '/api/auth/:path*',
          destination: 'http://127.0.0.1:8000/api/auth/:path*',
        },
        {
          source: '/api/user',
          destination: 'http://127.0.0.1:8000/api/user',
        },
        {
          source: '/api/modules/:path*',
          destination: 'http://127.0.0.1:8000/api/modules/:path*',
        },
        {
          source: '/api/modules',
          destination: 'http://127.0.0.1:8000/api/modules',
        },
        {
          source: '/api/admin/:path*',
          destination: 'http://127.0.0.1:8000/api/admin/:path*',
        },
        {
          source: '/api/simulations/:path*',
          destination: 'http://127.0.0.1:8000/api/simulations/:path*',
        },
        {
          source: '/api/simulations',
          destination: 'http://127.0.0.1:8000/api/simulations',
        },
        {
          source: '/api/sessions/:path*',
          destination: 'http://127.0.0.1:8000/api/sessions/:path*',
        },
        {
          source: '/api/sessions',
          destination: 'http://127.0.0.1:8000/api/sessions',
        },
        {
          source: '/api/ai/:path*',
          destination: 'http://127.0.0.1:8000/api/ai/:path*',
        },
      ],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:8000/api/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'http://127.0.0.1:8000/uploads/:path*',
        },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: '/explore',
        destination: '/tanya-ai',
        permanent: false,
      },
      {
        source: '/eksplorasi',
        destination: '/tanya-ai',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
