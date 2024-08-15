/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/:path*`, // Proxy to Backend
      },
    ]
  },
  publicRuntimeConfig: {
    backendHost: process.env.NEXT_PUBLIC_BACKEND_HOST,
    backendPort: process.env.NEXT_PUBLIC_BACKEND_PORT,
    frontendPort: process.env.NEXT_PUBLIC_FRONTEND_PORT,
  },
}

export default nextConfig
