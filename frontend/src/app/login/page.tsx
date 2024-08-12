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
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid username or password')
    } else {
      router.push('/home')
    }
  }

  return (
    <Box maxWidth="400px" margin="auto" mt={8} p={6} borderRadius="md" boxShadow="lg" bg="white">
      <Flex direction="column" align="center" mb={6}>
        <Logo src="/images/cyclops_logo-dark.png" alt="Cyclops Logo" width={240} height={240} />
        <Text fontSize="2xl" fontWeight="bold" mt={4} mb={6}>Login</Text>
      </Flex>
      <form onSubmit={handleLogin}>
        <VStack spacing={2}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Button type="submit" colorScheme="blue" width="full">
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
