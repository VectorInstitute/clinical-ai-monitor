'use client'
import React, { useEffect, useState } from 'react'
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
  Icon
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/sidebar'
import { useModelContext } from '../context/model'
import Link from 'next/link'
import { FiMonitor, FiAlertCircle } from 'react-icons/fi'

export default function HomePage() {
  const router = useRouter()
  const { models, fetchModels, isLoading } = useModelContext()
  const [error, setError] = useState<string | null>(null)
  const hospitalName = "University Health Network" // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const dividerColor = useColorModeValue('gray.200', 'gray.600')
  const noModelsTextColor = useColorModeValue('gray.600', 'gray.400')
  const modelVersionColor = useColorModeValue('gray.600', 'gray.300')
  const modelEndpointColor = useColorModeValue('gray.500', 'gray.400')

  useEffect(() => {
    const loadModels = async () => {
      try {
        await fetchModels()
      } catch (error) {
        console.error('Failed to fetch models:', error)
        setError('Failed to load models. Please try again later.')
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
          <Button colorScheme="blue" onClick={() => fetchModels()}>
            Retry
          </Button>
        </Center>
      )
    }
    const monitoredModels = models.filter(model => model.endpoints.length > 0);
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
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, lg: 8 }}>
        {monitoredModels.map((model) => (
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
                {model.basic_info.name}
              </Heading>
              <Text fontSize="sm" color={modelVersionColor}>
                Version: {model.basic_info.version}
              </Text>
              <Text fontSize="xs" color={modelEndpointColor}>
                Endpoints: {model.endpoints.join(', ')}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar hospitalName={hospitalName} />
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
