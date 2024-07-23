/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://backend:${process.env.NEXT_PUBLIC_BACKEND_PORT}/:path*`, // Proxy to Backend
      },
    ]
  },
}

export default nextConfig
