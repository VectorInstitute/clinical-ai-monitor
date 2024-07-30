export interface ValidationAndPerformance {
    internal_validation: string;
    external_validation: string;
    performance_in_subgroups: string[];
  }

  export interface OtherInformation {
    approval_date: string;
    license: string;
    contact_information: string;
    publication_link?: string;
  }

  export interface ModelFacts {
    name: string;
    version: string;
    type: 'Deep Learning Model' | 'Machine Learning Model' | 'Statistical Model';
    intended_use: string;
    target_population: string;
    input_data: string[];
    output_data: string;
    summary: string;
    mechanism_of_action: string;
    validation_and_performance: ValidationAndPerformance;
    uses_and_directions: string[];
    warnings: string[];
    other_information: OtherInformation;
  }

  // Utility type for partial updates
  export type PartialModelFacts = Partial<ModelFacts>;

  // Validation function (optional, can be used with form libraries like Formik or React Hook Form)
  export function validateModelFacts(facts: ModelFacts): string[] {
    const errors: string[] = [];

    if (!facts.name) errors.push("Name is required");
    if (!facts.version) errors.push("Version is required");
    if (!facts.type) errors.push("Type is required");
    if (!facts.intended_use) errors.push("Intended use is required");
    if (!facts.target_population) errors.push("Target population is required");
    if (facts.input_data.length === 0) errors.push("At least one input data item is required");
    if (!facts.output_data) errors.push("Output data is required");
    if (!facts.summary) errors.push("Summary is required");
    if (!facts.mechanism_of_action) errors.push("Mechanism of action is required");

    if (!facts.validation_and_performance.internal_validation) {
      errors.push("Internal validation is required");
    }
    if (!facts.validation_and_performance.external_validation) {
      errors.push("External validation is required");
    }
    if (facts.validation_and_performance.performance_in_subgroups.length === 0) {
      errors.push("At least one subgroup performance item is required");
    }

    if (facts.uses_and_directions.length === 0) {
      errors.push("At least one use/direction is required");
    }
    if (facts.warnings.length === 0) {
      errors.push("At least one warning is required");
    }

    if (!facts.other_information.approval_date) errors.push("Approval date is required");
    if (!facts.other_information.license) errors.push("License is required");
    if (!facts.other_information.contact_information) errors.push("Contact information is required");

    return errors;
  }
