import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
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
  Tooltip,
  IconButton,
  HStack,
  useTheme,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit, FiCheckSquare } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import SelectModelModal from './select-model-modal';

interface EndpointCardProps {
  endpoint: {
    name: string;
    metrics: string[];
  };
  groupedModels: Record<string, { version: string; id: string }[]>;
  onAddModel: () => void;
  onRemoveModel: () => void;
  onUpdateFacts: (modelId: string) => void;
  onUpdateCriteria: (modelId: string) => void;
}

const EndpointCard: React.FC<EndpointCardProps> = ({
  endpoint,
  groupedModels,
  onAddModel,
  onRemoveModel,
  onUpdateFacts,
  onUpdateCriteria,
}) => {
  const { isOpen: isModelSelectOpen, onOpen: onModelSelectOpen, onClose: onModelSelectClose } = useDisclosure();
  const { isOpen: isCriteriaSelectOpen, onOpen: onCriteriaSelectOpen, onClose: onCriteriaSelectClose } = useDisclosure();
  const router = useRouter();
  const theme = useTheme();

  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('blue.100', 'blue.700');
  const text = useColorModeValue('gray.800', 'gray.100');
  const accent = useColorModeValue('blue.500', 'blue.300');
  const secondaryText = useColorModeValue('gray.600', 'gray.400');

  const colors = useMemo(() => ({
    cardBg,
    border,
    text,
    accent,
    secondaryText,
  }), [cardBg, border, text, accent, secondaryText]);

  const renderMetrics = () => (
    <Wrap spacing={2}>
      {endpoint.metrics.map((metric, index) => (
        <WrapItem key={index}>
          <Tooltip label={metric} placement="top">
            <Badge colorScheme="teal" px={2} py={1} borderRadius="full" fontSize="sm">
              {metric.length > 15 ? `${metric.slice(0, 12)}...` : metric}
            </Badge>
          </Tooltip>
        </WrapItem>
      ))}
    </Wrap>
  );

  const renderModels = () => (
    <>
      <Wrap spacing={2}>
        {Object.entries(groupedModels).map(([modelName, versions]) => (
          <WrapItem key={modelName}>
            <Tag size="md" borderRadius="full" variant="subtle" colorScheme="blue">
              <TagLabel fontWeight="medium">{modelName}</TagLabel>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
      <Text mt={2} fontSize="sm" color={colors.secondaryText}>Versions:</Text>
      <Wrap spacing={2} mt={1}>
        {Object.values(groupedModels).flat().map(({ version, id }) => (
          <WrapItem key={id}>
            <Tooltip label={`ID: ${id}`} placement="top">
              <Badge colorScheme="purple" px={2} py={1} borderRadius="full" fontSize="sm">
                {version}
              </Badge>
            </Tooltip>
          </WrapItem>
        ))}
      </Wrap>
    </>
  );

  const handleUpdateCriteria = (modelId: string) => {
    onCriteriaSelectClose();
    router.push(`/configure/evaluation-criteria/${modelId}`);
  };

  const actionButtons = [
    { label: 'Add Model', icon: FiPlus, color: 'green', onClick: onAddModel },
    { label: 'Remove Model', icon: FiTrash2, color: 'red', onClick: onRemoveModel },
    { label: 'Update Facts', icon: FiEdit, color: 'blue', onClick: onModelSelectOpen },
    { label: 'Update Criteria', icon: FiCheckSquare, color: 'purple', onClick: onCriteriaSelectOpen },
  ];

  return (
    <Box
      bg={colors.cardBg}
      borderRadius="xl"
      borderWidth="2px"
      borderColor={colors.border}
      p={4}
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: 'lg', borderColor: colors.accent }}
    >
      <VStack align="stretch" spacing={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" size="lg" color={colors.accent}>
            {endpoint.name}
          </Heading>
          <HStack spacing={1}>
            {actionButtons.map((button, index) => (
              <Tooltip key={index} label={button.label} placement="top">
                <IconButton
                  aria-label={button.label}
                  icon={<button.icon />}
                  size="sm"
                  colorScheme={button.color}
                  variant="ghost"
                  onClick={button.onClick}
                />
              </Tooltip>
            ))}
          </HStack>
        </Flex>

        <Accordion allowMultiple>
          <AccordionItem border="none">
            <AccordionButton pl={0} _hover={{ bg: 'transparent' }}>
              <Text fontWeight="bold" color={colors.text} fontSize="md">
                Metrics
              </Text>
              <AccordionIcon ml="auto" color={colors.accent} />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {renderMetrics()}
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="none">
            <AccordionButton pl={0} _hover={{ bg: 'transparent' }}>
              <Text fontWeight="bold" color={colors.text} fontSize="md">
                Models
              </Text>
              <AccordionIcon ml="auto" color={colors.accent} />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {renderModels()}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
      <SelectModelModal
        title="Select Model to Update Facts"
        isOpen={isModelSelectOpen}
        onClose={onModelSelectClose}
        groupedModels={groupedModels}
        onSelectModel={onUpdateFacts}
      />
      <SelectModelModal
        title="Select Model to Update Criteria"
        isOpen={isCriteriaSelectOpen}
        onClose={onCriteriaSelectClose}
        groupedModels={groupedModels}
        onSelectModel={handleUpdateCriteria}
      />
    </Box>
  );
};

export default EndpointCard;
