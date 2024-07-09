import React from 'react';
import { FieldArray, Field } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Flex,
  Button,
  VStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

export const SubgroupsSection: React.FC = () => (
  <FieldArray name="subgroups">
    {({ push, remove, form }) => (
      <FormControl>
        <FormLabel>Subgroups</FormLabel>
        {form.values.subgroups.map((_, index) => (
          <VStack key={index} spacing={2} align="stretch" mb={4}>
            <Field
              as={Input}
              name={`subgroups.${index}.name`}
              placeholder="Subgroup name"
            />
            <Field
              as={Input}
              name={`subgroups.${index}.condition.min_value`}
              placeholder="Minimum value"
              type="number"
            />
            <IconButton
              aria-label="Remove subgroup"
              icon={<DeleteIcon />}
              onClick={() => remove(index)}
            />
          </VStack>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={() => push({ name: '', condition: { min_value: '' } })}
        >
          Add Subgroup
        </Button>
      </FormControl>
    )}
  </FieldArray>
);
