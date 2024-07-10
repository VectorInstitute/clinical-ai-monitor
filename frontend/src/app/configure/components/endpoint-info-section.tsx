import React from 'react';
import { Field, ErrorMessage } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react';

export const EndpointInfoSection: React.FC = () => (
  <>
    <FormControl>
      <FormLabel htmlFor="endpoint_name">Endpoint Name</FormLabel>
      <Field id="endpoint_name" name="endpoint_name" as={Input} />
      <ErrorMessage name="endpoint_name" component={FormErrorMessage} />
    </FormControl>
    <FormControl>
      <FormLabel htmlFor="model_name">Model Name</FormLabel>
      <Field id="model_name" name="model_name" as={Input} />
      <ErrorMessage name="model_name" component={FormErrorMessage} />
    </FormControl>
    <FormControl>
      <FormLabel htmlFor="model_description">Model Description</FormLabel>
      <Field id="model_description" name="model_description" as={Input} />
      <ErrorMessage name="model_description" component={FormErrorMessage} />
    </FormControl>
  </>
);
