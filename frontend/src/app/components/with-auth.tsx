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

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated()) {
        router.push('/login')
      }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
      return <LoadingScreen />
    }

    if (!isAuthenticated()) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}
