import React from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Badge,
  Icon,
  Tooltip,
  Divider,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

interface ModelCardProps {
  model: {
    basic_info: {
      name: string;
      version: string;
    };
    overall_status: string;
    endpoints: string[];
  };
  onClick: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onClick }) => {
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const modelVersionColor = useColorModeValue('gray.600', 'gray.300')

  const getStatusColor = (status: string) => {
    return status === 'No warnings' ? 'green' : 'red'
  }

  const getStatusIcon = (status: string) => {
    return status === 'No warnings' ? FiCheckCircle : FiAlertCircle
  }

  return (
    <Box
      p={4}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={cardBgColor}
      borderColor={cardBorderColor}
      onClick={onClick}
      cursor="pointer"
      transition="all 0.3s"
      _hover={{
        shadow: 'lg',
        transform: 'translateY(-2px)'
      }}
    >
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading as="h3" size="md" color={textColor}>
            {model.basic_info.name}
          </Heading>
          <Text fontSize="sm" color={modelVersionColor}>
            Version: {model.basic_info.version}
          </Text>
        </VStack>
        <Tooltip label={`Status: ${model.overall_status}`}>
          <Badge colorScheme={getStatusColor(model.overall_status)} p={2} borderRadius="full">
            <Icon as={getStatusIcon(model.overall_status)} />
          </Badge>
        </Tooltip>
      </Flex>
      <Divider my={2} />
      <HStack spacing={2} wrap="wrap">
        {model.endpoints.map((endpoint: string, index: number) => (
          <Badge key={index} colorScheme="blue" variant="outline">
            {endpoint}
          </Badge>
        ))}
      </HStack>
    </Box>
  )
}

export default ModelCard
