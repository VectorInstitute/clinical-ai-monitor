import React from 'react';
import { Box, Heading, Text, VStack, Link } from '@chakra-ui/react';
import { OtherInformation } from '../../../../configure/types/facts'

interface OtherInformationSectionProps {
  otherInfo: OtherInformation;
}

const OtherInformationSection: React.FC<OtherInformationSectionProps> = ({ otherInfo }) => (
  <Box>
    <Heading as="h3" size="md" mb={2}>Other Information</Heading>
    <VStack align="stretch" spacing={2}>
      <Text><strong>Approval Date:</strong> {otherInfo.approval_date}</Text>
      <Text><strong>License:</strong> {otherInfo.license}</Text>
      <Text><strong>Contact:</strong> {otherInfo.contact_information}</Text>
      {otherInfo.publication_link && (
        <Link color="blue.500" href={otherInfo.publication_link} isExternal>
          View Publication
        </Link>
      )}
    </VStack>
  </Box>
);

export default OtherInformationSection;
