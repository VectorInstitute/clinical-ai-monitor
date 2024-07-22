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
    type: string;
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
