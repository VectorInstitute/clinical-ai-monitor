'use client'

import React, { useState, FormEvent, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Flex,
  useToast,
  Container,
  Heading,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Logo from './logo'
import { useAuth } from '../context/auth'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading, isAuthenticated } = useAuth()
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated()) {
      router.replace('/home')
    }
  }, [isAuthenticated, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await login(credentials.username, credentials.password)
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" centerContent>
        <Box textAlign="center" mt={8}>
          <Text fontSize="xl">Loading...</Text>
        </Box>
      </Container>
    )
  }

  if (isAuthenticated()) {
    return null
  }

  return (
    <Container maxWidth="md" centerContent>
      <Box width="full" maxWidth="400px" mt={8} p={6} borderRadius="md" boxShadow="lg" bg="white">
        <Flex direction="column" align="center" mb={6}>
          <Logo src="/images/cyclops_logo-dark.png" alt="Cyclops Logo" width={240} height={240} />
          <Heading as="h1" size="xl" mt={4} mb={6}>Login</Heading>
        </Flex>
        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleInputChange}
                autoComplete="username"
                isDisabled={isSubmitting}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                isDisabled={isSubmitting}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isSubmitting}
              loadingText="Logging in..."
              isDisabled={!credentials.username || !credentials.password}
            >
              Login
            </Button>
          </VStack>
        </form>
        <Flex justify="center" mt={8}>
          <Logo src="/images/vector_logo.png" alt="Vector Institute Logo" width={120} height={120} />
        </Flex>
      </Box>
    </Container>
  )
}
