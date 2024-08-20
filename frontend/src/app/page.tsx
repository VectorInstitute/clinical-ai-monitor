'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context/auth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated() ? '/home' : '/login')
    }
  }, [isLoading, isAuthenticated, router])

  return null
}
