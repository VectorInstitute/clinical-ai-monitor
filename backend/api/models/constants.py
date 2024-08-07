"""Constants."""

from typing import Dict, List


METRIC_TOOLTIPS: Dict[str, str] = {
    "binary_accuracy": "Proportion of correct predictions (both true positives and true negatives) among the total number of cases examined.",
    "binary_auroc": "Area Under the Receiver Operating Characteristic Curve, measuring the ability to distinguish between classes.",
    "binary_average_precision": "Average precision summarizes a precision-recall curve as the weighted mean of precisions achieved at each threshold.",
    "binary_confusion_matrix": "Table layout of prediction outcomes, showing true positives, false positives, true negatives, and false negatives.",
    "binary_f1_score": "Harmonic mean of precision and recall, providing a single score that balances both metrics.",
    "binary_fbeta_score": "Weighted harmonic mean of precision and recall, with beta parameter determining the weight of recall in the combined score.",
    "binary_mcc": "Matthews Correlation Coefficient, a balanced measure which can be used even if the classes are of very different sizes.",
    "binary_npv": "Negative Predictive Value, the proportion of negative results that are true negatives.",
    "binary_ppv": "Positive Predictive Value, equivalent to precision, the proportion of positive results that are true positives.",
    "binary_precision": "Proportion of true positive predictions among all positive predictions.",
    "binary_recall": "Proportion of true positive predictions among all actual positive cases.",
    "binary_tpr": "True Positive Rate, equivalent to recall, the proportion of actual positive cases that were correctly identified.",
    "binary_precision_recall_curve": "Curve showing the tradeoff between precision and recall at different classification thresholds.",
    "binary_roc": "Receiver Operating Characteristic curve, showing the tradeoff between true positive rate and false positive rate at various thresholds.",
    "binary_specificity": "Proportion of actual negative cases that were correctly identified.",
    "binary_tnr": "True Negative Rate, equivalent to specificity, the proportion of actual negative cases that were correctly identified.",
}

METRIC_DISPLAY_NAMES: Dict[str, str] = {
    "binary_accuracy": "Accuracy",
    "binary_auroc": "AUROC",
    "binary_average_precision": "Average Precision",
    "binary_confusion_matrix": "Confusion Matrix",
    "binary_f1_score": "F1 Score",
    "binary_fbeta_score": "F-beta Score",
    "binary_mcc": "Matthews Correlation Coefficient",
    "binary_npv": "Negative Predictive Value",
    "binary_ppv": "Positive Predictive Value",
    "binary_precision": "Precision",
    "binary_recall": "Recall",
    "binary_tpr": "True Positive Rate",
    "binary_precision_recall_curve": "Precision-Recall Curve",
    "binary_roc": "ROC Curve",
    "binary_specificity": "Specificity",
    "binary_tnr": "True Negative Rate",
}

VALID_METRIC_NAMES: List[str] = [
    "binary_accuracy",
    "binary_auroc",
    "binary_average_precision",
    "binary_confusion_matrix",
    "binary_f1_score",
    "binary_fbeta_score",
    "binary_mcc",
    "binary_npv",
    "binary_ppv",
    "binary_precision",
    "binary_recall",
    "binary_tpr",
    "binary_precision_recall_curve",
    "binary_roc",
    "binary_specificity",
    "binary_tnr",
]
