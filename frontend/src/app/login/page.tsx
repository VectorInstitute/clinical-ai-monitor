'use client'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Input, VStack, Flex, Text } from '@chakra-ui/react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Logo from './logo'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.status === 401) {
          setError('Invalid username or password')
        } else {
          setError('An error occurred. Please try again.')
        }
      } else {
        router.push('/home')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box maxWidth="400px" margin="auto" mt={8} p={6} borderRadius="md" boxShadow="lg" bg="white">
      <Flex direction="column" align="center" mb={6}>
        <Logo src="/images/cyclops_logo-dark.png" alt="Cyclops Logo" width={240} height={240} />
        <Text fontSize="2xl" fontWeight="bold" mt={4} mb={6}>Login</Text>
      </Flex>
      <form onSubmit={handleLogin}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isDisabled={isLoading}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isDisabled={isLoading}
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
            loadingText="Logging in"
            isDisabled={!username || !password || isLoading}
          >
            Login
          </Button>
        </VStack>
      </form>
      <Box height={16} />
      <Flex justify="center" mt={6}>
        <Logo src="/images/vector_logo.png" alt="Vector Institute Logo" width={120} height={120} />
      </Flex>
    </Box>
  )
}
