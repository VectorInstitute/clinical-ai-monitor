/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    backendHost: process.env.NEXT_PUBLIC_BACKEND_HOST,
    backendPort: process.env.NEXT_PUBLIC_BACKEND_PORT,
    frontendPort: process.env.NEXT_PUBLIC_FRONTEND_PORT,
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['localhost', process.env.NEXT_PUBLIC_BACKEND_HOST].filter(Boolean),
  },
}

export default nextConfig
