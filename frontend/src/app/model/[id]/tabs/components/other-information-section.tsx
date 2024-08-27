import React from 'react';
import { Box, Heading, Text, VStack, Link, Grid, GridItem } from '@chakra-ui/react';
import { OtherInformation } from '../../../../types/facts'

interface OtherInformationSectionProps {
  otherInfo: OtherInformation;
}

const OtherInformationSection: React.FC<OtherInformationSectionProps> = ({ otherInfo }) => (
  <Box>
    <Heading as="h3" size="md" mb={4}>Other Information</Heading>
    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
      <GridItem>
        <Text><strong>Approval Date:</strong> {otherInfo.approval_date}</Text>
      </GridItem>
      <GridItem>
        <Text><strong>License:</strong> {otherInfo.license}</Text>
      </GridItem>
      <GridItem>
        <Text><strong>Contact:</strong> {otherInfo.contact_information}</Text>
      </GridItem>
      <GridItem>
        {otherInfo.publication_link && (
          <Link color="blue.500" href={otherInfo.publication_link} isExternal>
            View Publication
          </Link>
        )}
      </GridItem>
    </Grid>
  </Box>
);

export default OtherInformationSection;
