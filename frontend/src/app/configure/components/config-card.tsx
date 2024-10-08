import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Button,
  useColorModeValue,
  Flex,
  Text,
  Icon,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface ConfigCardProps {
  title: string;
  description: string;
  icon: IconType;
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
      p={{ base: 4, md: 6 }}
      borderRadius="lg"
      shadow="md"
      borderWidth={1}
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
    >
      <VStack spacing={4} align="stretch">
        <Flex align="center">
          <Icon as={icon} boxSize={{ base: 6, md: 8 }} color={`${buttonColor}.500`} mr={4} />
          <Heading as="h3" size={{ base: "sm", md: "md" }} color={textColor}>
            {title}
          </Heading>
        </Flex>
        <Text color={textColor} fontSize={{ base: "sm", md: "md" }}>{description}</Text>
        <Button
          colorScheme={buttonColor}
          onClick={onClick}
          leftIcon={<Icon as={icon} />}
          size={{ base: "sm", md: "md" }}
          width="full"
        >
          {buttonText}
        </Button>
      </VStack>
    </Box>
  );
};

export default ConfigCard;
