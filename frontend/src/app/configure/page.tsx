'use client'

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  useColorModeValue,
  Flex,
  Text,
  SimpleGrid,
  Icon,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import Sidebar from '../components/sidebar';
import CreateServerForm from './components/create-server-form';
import DeleteServerForm from './components/delete-server-form';

export default function ConfigurationPage() {
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const hospitalName = "University Health Network"; // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="xl" color={textColor}>
              Configure Monitoring Servers
            </Heading>
            <Tooltip label="Manage your model monitoring servers here" placement="top">
              <Icon as={FiInfo} color={textColor} boxSize={6} />
            </Tooltip>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <ConfigCard
              title="Create New Server"
              description="Set up a new model monitoring server with custom metrics and subgroups."
              icon={FiPlus}
              buttonText="Create Server"
              buttonColor="blue"
              onClick={onCreateOpen}
            />
            <ConfigCard
              title="Delete Existing Server"
              description="Remove a model monitoring server that is no longer needed."
              icon={FiTrash2}
              buttonText="Delete Server"
              buttonColor="red"
              onClick={onDeleteOpen}
            />
          </SimpleGrid>
        </VStack>
      </Box>
      <CreateServerForm isOpen={isCreateOpen} onClose={onCreateClose} />
      <DeleteServerForm isOpen={isDeleteOpen} onClose={onDeleteClose} />
    </Flex>
  );
}

interface ConfigCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  buttonText: string;
  buttonColor: string;
  onClick: () => void;
}

const ConfigCard: React.FC<ConfigCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  buttonColor,
  onClick,
}) => {
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      bg={cardBgColor}
      p={6}
      borderRadius="lg"
      shadow="md"
      borderWidth={1}
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
    >
      <VStack spacing={4} align="stretch">
        <Flex align="center">
          <Icon as={icon} boxSize={8} color={`${buttonColor}.500`} mr={4} />
          <Heading as="h3" size="md" color={textColor}>
            {title}
          </Heading>
        </Flex>
        <Text color={textColor}>{description}</Text>
        <Button
          colorScheme={buttonColor}
          onClick={onClick}
          leftIcon={<Icon as={icon} />}
        >
          {buttonText}
        </Button>
      </VStack>
    </Box>
  );
};
