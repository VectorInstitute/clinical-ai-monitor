// app/page.tsx
'use client'
import { useState } from 'react'
import { Box, Button, FormControl, FormLabel, Input, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual login logic
    router.push('/home')
  }

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <form onSubmit={handleLogin}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue">Login</Button>
        </VStack>
      </form>
    </Box>
  )
}
