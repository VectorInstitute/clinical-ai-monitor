'use client'
import React, { useEffect, useState, useCallback } from 'react'
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Heading,
  VStack,
  useColorModeValue,
  Button,
  Center,
  Spinner,
  Container,
  Divider,
  Icon,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/sidebar'
import { useModelContext } from '../context/model'
import Link from 'next/link'
import { FiMonitor, FiAlertCircle } from 'react-icons/fi'
import ModelCard from '../components/model-card'
import { debounce } from 'lodash'

export default function HomePage() {
  const router = useRouter()
  const { models, fetchModels, isLoading } = useModelContext()
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const dividerColor = useColorModeValue('gray.200', 'gray.600')
  const noModelsTextColor = useColorModeValue('gray.600', 'gray.400')

  const debouncedFetchModels = useCallback(
    debounce(async () => {
      try {
        await fetchModels()
      } catch (error) {
        console.error('Failed to fetch models:', error)
        setError('Failed to load models. Please try again later.')
      } finally {
        setIsInitialLoadComplete(true)
      }
    }, 300),
    [fetchModels]
  )

  useEffect(() => {
    debouncedFetchModels()
    return () => debouncedFetchModels.cancel()
  }, [debouncedFetchModels])

  const renderContent = () => {
    if (!isInitialLoadComplete || isLoading) {
      return (
        <Center h="50vh" flexDirection="column">
          <Spinner size="xl" color={accentColor} mb={4} />
          <Text color={textColor}>Loading models...</Text>
        </Center>
      )
    }

    if (error) {
      return (
        <Center flexDirection="column" p={8} bg={cardBgColor} borderRadius="lg" shadow="md">
          <Icon as={FiAlertCircle} boxSize={12} color="red.500" mb={4} />
          <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
            Error
          </Text>
          <Text fontSize="md" mb={6} textAlign="center" color={noModelsTextColor}>
            {error}
          </Text>
          <Button colorScheme="blue" onClick={() => debouncedFetchModels()}>
            Retry
          </Button>
        </Center>
      )
    }

    const monitoredModels = models.filter(model => model.endpoints.length > 0)
    if (monitoredModels.length === 0) {
      return (
        <Center flexDirection="column" p={8} bg={cardBgColor} borderRadius="lg" shadow="md">
          <Icon as={FiAlertCircle} boxSize={12} color={accentColor} mb={4} />
          <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
            No Models Configured
          </Text>
          <Text fontSize="md" mb={6} textAlign="center" color={noModelsTextColor}>
            To start monitoring a model, you need to configure its evaluation parameters.
          </Text>
          <Link href="/configure" passHref>
            <Button colorScheme="blue" size="lg" leftIcon={<FiMonitor />}>
              Configure a New Model
            </Button>
          </Link>
        </Center>
      )
    }

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {monitoredModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onClick={() => router.push(`/model/${model.id}`)}
          />
        ))}
      </SimpleGrid>
    )
  }

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box
        ml={{ base: 0, md: 60 }}
        w="full"
        transition="margin-left 0.3s"
      >
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box bg={cardBgColor} p={8} borderRadius="lg" shadow="md">
              <Heading as="h1" size="xl" color={textColor} mb={4}>
                AI Model Monitoring Hub
              </Heading>
              <Text fontSize="lg" color={noModelsTextColor}>
                Monitor your clinical AI models in real-time.
              </Text>
            </Box>
            <Divider borderColor={dividerColor} />
            <Box>
              <Heading as="h2" size="lg" color={textColor} mb={6}>
                Monitored Models
              </Heading>
              {renderContent()}
            </Box>
          </VStack>
        </Container>
      </Box>
    </Flex>
  )
}
