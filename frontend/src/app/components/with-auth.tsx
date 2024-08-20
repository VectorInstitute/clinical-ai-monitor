'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/auth'
import { Box, Spinner, Flex, Text } from '@chakra-ui/react'

const LoadingScreen: React.FC = () => (
  <Flex height="100vh" alignItems="center" justifyContent="center" flexDirection="column">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="blue.500"
      size="xl"
    />
    <Text mt={4} fontSize="lg" fontWeight="medium">
      Loading...
    </Text>
  </Flex>
)

interface WithAuthOptions {
  requiredRole?: 'admin' | 'viewer'
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function WithAuth(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated()) {
          router.push('/login')
        } else if (options.requiredRole && user?.role !== options.requiredRole) {
          router.push('/unauthorized')
        }
      }
    }, [isLoading, isAuthenticated, user, router])

    if (isLoading) {
      return <LoadingScreen />
    }

    if (!isAuthenticated() || (options.requiredRole && user?.role !== options.requiredRole)) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
