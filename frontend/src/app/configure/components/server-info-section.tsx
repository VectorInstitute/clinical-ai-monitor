import React from 'react';
import { Field, ErrorMessage } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react';

export const ServerInfoSection: React.FC = () => (
  <>
    <FormControl>
      <FormLabel>Server Name</FormLabel>
      <Field name="server_name" as={Input} />
      <ErrorMessage name="server_name" component={FormErrorMessage} />
    </FormControl>
    <FormControl>
      <FormLabel>Model Name</FormLabel>
      <Field name="model_name" as={Input} />
      <ErrorMessage name="model_name" component={FormErrorMessage} />
    </FormControl>
    <FormControl>
      <FormLabel>Model Description</FormLabel>
      <Field name="model_description" as={Input} />
      <ErrorMessage name="model_description" component={FormErrorMessage} />
    </FormControl>
  </>
);
