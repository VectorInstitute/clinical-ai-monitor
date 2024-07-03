// app/home/page.tsx
'use client'
import { Box, SimpleGrid, Text, Flex, Heading, VStack, useColorModeValue } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/sidebar'

const models = [
  { id: 1, name: 'Model A', description: 'Chest Pneumothorax model' },
  { id: 2, name: 'Model B', description: 'Wrist x-ray model' },
  { id: 3, name: 'Model C', description: 'Delrium risk calculator model' },
]

export default function HomePage() {
  const router = useRouter()
  const hospitalName = "University Health Network" // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar hospitalName={hospitalName} />
      <Box
        ml={{ base: 0, md: 60 }}
        p={{ base: 4, md: 8 }}
        w="full"
        transition="margin-left 0.3s"
      >
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color={textColor}>
            Deployed Models
          </Heading>
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 3 }}
            spacing={{ base: 4, lg: 8 }}
          >
            {models.map((model) => (
              <Box
                key={model.id}
                p={6}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                bg={cardBgColor}
                borderColor={cardBorderColor}
                onClick={() => router.push(`/model/${model.id}`)}
                cursor="pointer"
                transition="all 0.3s"
                _hover={{
                  shadow: 'lg',
                  transform: 'translateY(-5px)'
                }}
              >
                <VStack align="start" spacing={3}>
                  <Heading as="h3" size="md" color={textColor}>
                    {model.name}
                  </Heading>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                    {model.description}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    </Flex>
  )
}
