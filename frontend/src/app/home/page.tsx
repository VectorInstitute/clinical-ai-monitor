'use client'
import React, { useEffect, useState } from 'react'
import { Box, SimpleGrid, Text, Flex, Heading, VStack, useColorModeValue, Button, Center, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/sidebar'
import { useModelContext } from '../context/model'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const { models, fetchModels } = useModelContext()
  const [isLoading, setIsLoading] = useState(true)
  const hospitalName = "University Health Network" // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')

  useEffect(() => {
    const loadModels = async () => {
      try {
        await fetchModels()
      } catch (error) {
        console.error('Failed to fetch models:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadModels()
  }, [fetchModels])

  const renderContent = () => {
    if (isLoading) {
      return (
        <Center h="50vh">
          <Spinner size="xl" color={accentColor} />
        </Center>
      )
    }

    if (models.length === 0) {
      return (
        <Center flexDirection="column" p={8} bg={cardBgColor} borderRadius="lg" shadow="md">
          <Text fontSize="lg" mb={4} textAlign="center">
            No models are currently configured for monitoring.
          </Text>
          <Text fontSize="md" mb={6} textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
            To start monitoring a model, you need to configure its evaluation parameters.
          </Text>
          <Link href="/configure" passHref>
            <Button colorScheme="blue" size="lg">
              Configure a New Model
            </Button>
          </Link>
        </Center>
      )
    }

    return (
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, lg: 8 }}>
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
              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                Server: {model.serverName}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    )
  }

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
            Clinical AI Model Monitoring Dashboard
          </Heading>
          {renderContent()}
        </VStack>
      </Box>
    </Flex>
  )
}
