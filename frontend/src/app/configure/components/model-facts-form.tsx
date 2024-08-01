import React from 'react';
import { Formik, Form } from 'formik';
import { VStack, Button } from '@chakra-ui/react';
import { ModelFacts } from '../types/facts'
import ModelFormFields from './model-form-fields';

interface ModelFactsFormProps {
  initialValues: ModelFacts;
  onSubmit: (values: ModelFacts) => Promise<void>;
}

const ModelFactsForm: React.FC<ModelFactsFormProps> = ({ initialValues, onSubmit }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
    >
      {({ values, errors, touched, isSubmitting }) => (
        <Form>
          <VStack spacing={6} align="stretch">
            <ModelFormFields values={values} errors={errors} touched={touched} />
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save Model Facts
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default ModelFactsForm;
