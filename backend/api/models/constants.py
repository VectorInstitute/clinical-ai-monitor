"""Constants."""

from typing import Dict, List


METRIC_TOOLTIPS: Dict[str, str] = {
    "binary_accuracy": "Proportion of correct predictions (both true positives and true negatives) among the total number of cases examined.",
    "binary_auroc": "Area Under the Receiver Operating Characteristic Curve, measuring the ability to distinguish between classes.",
    "binary_average_precision": "Average precision summarizes a precision-recall curve as the weighted mean of precisions achieved at each threshold.",
    "binary_f1_score": "Harmonic mean of precision and recall, providing a single score that balances both metrics.",
    "binary_mcc": "Matthews Correlation Coefficient, a balanced measure which can be used even if the classes are of very different sizes.",
    "binary_npv": "Negative Predictive Value, the proportion of negative results that are true negatives.",
    "binary_ppv": "Positive Predictive Value, equivalent to precision, the proportion of positive results that are true positives.",
    "binary_precision": "Proportion of true positive predictions among all positive predictions.",
    "binary_recall": "Proportion of true positive predictions among all actual positive cases.",
    "binary_tpr": "True Positive Rate, equivalent to recall, the proportion of actual positive cases that were correctly identified.",
    "binary_specificity": "Proportion of actual negative cases that were correctly identified.",
    "binary_sensitivity": "Proportion of actual positive cases that were correctly identified.",
    "binary_tnr": "True Negative Rate, equivalent to specificity, the proportion of actual negative cases that were correctly identified.",
}

METRIC_DISPLAY_NAMES: Dict[str, str] = {
    "binary_accuracy": "Accuracy",
    "binary_auroc": "AUROC",
    "binary_average_precision": "Average Precision",
    "binary_f1_score": "F1 Score",
    "binary_mcc": "Matthews Correlation Coefficient",
    "binary_npv": "Negative Predictive Value",
    "binary_ppv": "Positive Predictive Value",
    "binary_precision": "Precision",
    "binary_recall": "Recall",
    "binary_tpr": "True Positive Rate",
    "binary_specificity": "Specificity",
    "binary_sensitivity": "Sensitivity",
    "binary_tnr": "True Negative Rate",
}

VALID_METRIC_NAMES: List[str] = [
    "binary_accuracy",
    "binary_auroc",
    "binary_average_precision",
    "binary_f1_score",
    "binary_mcc",
    "binary_npv",
    "binary_ppv",
    "binary_precision",
    "binary_recall",
    "binary_tpr",
    "binary_specificity",
    "binary_sensitivity",
    "binary_tnr",
]
