// app/home/page.tsx
'use client'
import { Box, SimpleGrid, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

const models = [
  { id: 1, name: 'Model A' },
  { id: 2, name: 'Model B' },
  { id: 3, name: 'Model C' },
]

export default function HomePage() {
  const router = useRouter()

  return (
    <Box p={8}>
      <Text fontSize="2xl" mb={4}>Deployed Models</Text>
      <SimpleGrid columns={3} spacing={10}>
        {models.map((model) => (
          <Box
            key={model.id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            onClick={() => router.push(`/model/${model.id}`)}
            cursor="pointer"
          >
            <Text fontSize="xl">{model.name}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}
