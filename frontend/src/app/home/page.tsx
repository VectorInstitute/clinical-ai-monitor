'use client'
import React, { useEffect, useState, useCallback } from 'react'
import {
  Box,
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
  Badge,
  Tooltip,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/sidebar'
import { useModelContext } from '../context/model'
import Link from 'next/link'
import { FiMonitor, FiAlertCircle, FiCheckCircle, FiBox } from 'react-icons/fi'
import { debounce } from 'lodash'
import { withAuth } from '../components/with-auth'

function HomePage() {
  const router = useRouter()
  const { models, fetchModels, isLoading } = useModelContext()
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)

  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const dividerColor = useColorModeValue('gray.200', 'gray.700')
  const noModelsTextColor = useColorModeValue('gray.600', 'gray.400')

  const debouncedFetchModels = useCallback(() => {
    const fetchModelsDebounced = debounce(async () => {
      try {
        await fetchModels()
        setError(null)
      } catch (error) {
        console.error('Failed to fetch models:', error)
        setError('Failed to load models. Please try again later.')
      } finally {
        setIsInitialLoadComplete(true)
      }
    }, 300)

    fetchModelsDebounced()

    return () => {
      fetchModelsDebounced.cancel()
    }
  }, [fetchModels])

  useEffect(() => {
    const cleanup = debouncedFetchModels()
    return cleanup
  }, [debouncedFetchModels])

  const getStatusColor = (status: string) => status === 'No warnings' ? 'green' : 'red'
  const getStatusIcon = (status: string) => status === 'No warnings' ? FiCheckCircle : FiAlertCircle

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
          <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">Error</Text>
          <Text fontSize="md" mb={6} textAlign="center" color={noModelsTextColor}>{error}</Text>
          <Button colorScheme="blue" onClick={debouncedFetchModels}>Retry</Button>
        </Center>
      )
    }

    const monitoredModels = models.filter(model => model.endpoints.length > 0)
    if (monitoredModels.length === 0) {
      return (
        <Center flexDirection="column" p={8} bg={cardBgColor} borderRadius="lg" shadow="md">
          <Icon as={FiBox} boxSize={12} color={accentColor} mb={4} />
          <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">No Models Configured</Text>
          <Text fontSize="md" mb={6} textAlign="center" color={noModelsTextColor}>
            To start monitoring a model, you need to configure its evaluation parameters.
          </Text>
          <Link href="/configure" passHref>
            <Button as="a" colorScheme="blue" size="lg" leftIcon={<FiMonitor />}>Configure a New Model</Button>
          </Link>
        </Center>
      )
    }

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {monitoredModels.map((model) => (
          <Card
            key={model.id}
            bg={cardBgColor}
            shadow="md"
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.3s"
            cursor="pointer"
            onClick={() => router.push(`/model/${model.id}`)}
          >
            <CardBody>
              <Flex justify="space-between" align="center" mb={3}>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color={textColor}>{model.basic_info.name}</Heading>
                  <Text fontSize="sm" color={noModelsTextColor}>Version: {model.basic_info.version}</Text>
                </VStack>
                <Tooltip label={model.overall_status} placement="top">
                  <Badge colorScheme={getStatusColor(model.overall_status)} p={2} borderRadius="full">
                    <Icon as={getStatusIcon(model.overall_status)} />
                  </Badge>
                </Tooltip>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    )
  }

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box flex={1} ml={{ base: 0, md: 60 }} transition="margin-left 0.3s">
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box bg={cardBgColor} p={8} borderRadius="lg" shadow="md">
              <Heading as="h1" size="xl" color={textColor} mb={4}>AI Model Monitoring Hub</Heading>
              <Text fontSize="lg" color={noModelsTextColor}>Monitor your clinical AI models in real-time.</Text>
            </Box>
            <Divider borderColor={dividerColor} />
            <Box>
              <Heading as="h2" size="lg" color={textColor} mb={6}>Monitored Models</Heading>
              {renderContent()}
            </Box>
          </VStack>
        </Container>
      </Box>
    </Flex>
  )
}

export default withAuth(HomePage)
