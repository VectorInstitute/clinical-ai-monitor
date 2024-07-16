/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://0.0.0.0:8000/api/v1/:path*', // Proxy to Backend
      },
    ]
  },
}

export default nextConfig
