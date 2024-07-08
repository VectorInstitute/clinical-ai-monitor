import React from 'react';
import { FieldArray } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Flex,
  Button,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

export const SubgroupsSection: React.FC = () => (
  <FieldArray name="subgroups">
    {({ push, remove, form }) => (
      <FormControl>
        <FormLabel>Subgroups</FormLabel>
        {form.values.subgroups.map((_, index) => (
          <Flex key={index} mb={2}>
            <Input
              name={`subgroups.${index}.name`}
              placeholder="Subgroup name"
              mr={2}
            />
            <Input
              name={`subgroups.${index}.condition.value`}
              placeholder="Condition"
              mr={2}
            />
            <IconButton
              aria-label="Remove subgroup"
              icon={<DeleteIcon />}
              onClick={() => remove(index)}
            />
          </Flex>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={() => push({ name: '', condition: { value: '' } })}
        >
          Add Subgroup
        </Button>
      </FormControl>
    )}
  </FieldArray>
);
