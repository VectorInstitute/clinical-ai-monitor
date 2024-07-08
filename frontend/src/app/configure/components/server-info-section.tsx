import React from 'react';
import { Field } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';

export const ServerInfoSection: React.FC = () => (
  <>
    <FormControl>
      <FormLabel>Server Name</FormLabel>
      <Field name="server_name" as={Input} />
    </FormControl>
    <FormControl>
      <FormLabel>Model Name</FormLabel>
      <Field name="model_name" as={Input} />
    </FormControl>
    <FormControl>
      <FormLabel>Model Description</FormLabel>
      <Field name="model_description" as={Input} />
    </FormControl>
  </>
);
