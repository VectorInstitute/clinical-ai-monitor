import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Badge,
  Flex,
  useDisclosure,
  useBreakpointValue,
  Tooltip,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';
import SelectModelModal from './select-model-modal';

interface EndpointCardProps {
  endpoint: {
    name: string;
    metrics: string[];
  };
  groupedModels: { [key: string]: { version: string; id: string }[] };
  onAddModel: () => void;
  onRemoveModel: () => void;
  onUpdateFacts: (modelId: string) => void;
}

const EndpointCard: React.FC<EndpointCardProps> = ({
  endpoint,
  groupedModels,
  onAddModel,
  onRemoveModel,
  onUpdateFacts,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.100', 'blue.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  const buttonSize = useBreakpointValue({ base: 'xs', sm: 'sm', md: 'md' });
  const headingSize = useBreakpointValue({ base: 'md', sm: 'lg', md: 'xl' });
  const fontSize = useBreakpointValue({ base: 'xs', sm: 'sm', md: 'md' });

  return (
    <Box
      bg={cardBgColor}
      borderRadius="xl"
      borderWidth="2px"
      borderColor={borderColor}
      p={{ base: 3, sm: 4, md: 5 }}
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: 'lg', borderColor: accentColor }}
    >
      <VStack align="stretch" spacing={{ base: 4, sm: 5, md: 6 }}>
        <Heading as="h3" size={headingSize} color={accentColor}>
          {endpoint.name}
        </Heading>

        <Accordion allowMultiple>
          <AccordionItem border="none">
            <AccordionButton pl={0} _hover={{ bg: 'transparent' }}>
              <Flex flex="1" textAlign="left" alignItems="center">
                <Text fontWeight="bold" color={textColor} fontSize={fontSize}>
                  Metrics
                </Text>
              </Flex>
              <AccordionIcon color={accentColor} />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap spacing={2}>
                {endpoint.metrics.map((metric, index) => (
                  <WrapItem key={index}>
                    <Tooltip label={metric} placement="top">
                      <Badge colorScheme="teal" fontSize={fontSize} px={2} py={1} borderRadius="full">
                        {metric.length > 15 ? `${metric.substring(0, 12)}...` : metric}
                      </Badge>
                    </Tooltip>
                  </WrapItem>
                ))}
              </Wrap>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="none">
            <AccordionButton pl={0} _hover={{ bg: 'transparent' }}>
              <Flex flex="1" textAlign="left" alignItems="center">
                <Text fontWeight="bold" color={textColor} fontSize={fontSize}>
                  Models
                </Text>
              </Flex>
              <AccordionIcon color={accentColor} />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <Wrap spacing={2}>
                {Object.entries(groupedModels).map(([modelName, versions]) => (
                  <WrapItem key={modelName}>
                    <Tag size={buttonSize} borderRadius="full" variant="subtle" colorScheme="blue">
                      <TagLabel fontWeight="medium">{modelName}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
              <Text mt={2} fontSize={fontSize} color={useColorModeValue('gray.600', 'gray.400')}>Versions:</Text>
              <Wrap spacing={2} mt={1}>
                {Object.values(groupedModels).flat().map(({ version, id }) => (
                  <WrapItem key={id}>
                    <Tooltip label={`ID: ${id}`} placement="top">
                      <Badge colorScheme="purple" fontSize={fontSize} px={2} py={1} borderRadius="full">
                        {version}
                      </Badge>
                    </Tooltip>
                  </WrapItem>
                ))}
              </Wrap>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Flex justifyContent="flex-end" flexWrap="wrap" gap={2}>
          <Tooltip label="Add a new model to this endpoint">
            <Button
              leftIcon={<FiPlus />}
              size={buttonSize}
              colorScheme="green"
              variant="outline"
              onClick={onAddModel}
              _hover={{ bg: hoverBgColor }}
            >
              Add Model
            </Button>
          </Tooltip>
          <Tooltip label="Remove a model from this endpoint">
            <Button
              leftIcon={<FiTrash2 />}
              size={buttonSize}
              colorScheme="red"
              variant="outline"
              onClick={onRemoveModel}
              _hover={{ bg: hoverBgColor }}
            >
              Remove Model
            </Button>
          </Tooltip>
          <Tooltip label="Update facts for a model in this endpoint">
            <Button
              leftIcon={<FiEdit />}
              size={buttonSize}
              colorScheme="blue"
              variant="outline"
              onClick={onOpen}
              _hover={{ bg: hoverBgColor }}
            >
              Update Facts
            </Button>
          </Tooltip>
        </Flex>
      </VStack>
      <SelectModelModal
        isOpen={isOpen}
        onClose={onClose}
        groupedModels={groupedModels}
        onSelectModel={onUpdateFacts}
      />
    </Box>
  );
};

export default EndpointCard;
