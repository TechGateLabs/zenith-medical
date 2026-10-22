/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dt9tcazgl/image/upload/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/doctors',
        destination: '/about',
        permanent: true,
      },
      ...['/book', '/appointment', '/booking'].map((source) => ({
        source,
        destination: '/intake',
        permanent: true,
      })),
    ]
  },
  async rewrites() {
    return [{ source: '/health', destination: '/api/health' }]
  },
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      ...['/admin/:path*', '/api/:path*', '/intake/:path*'].map((source) => ({
        source,
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      })),
    ]
  },
}

module.exports = nextConfig
