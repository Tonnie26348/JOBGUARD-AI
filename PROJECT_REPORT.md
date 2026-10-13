# JOBGUARD AI — Initial Data Audit and Model Evaluation

**Project:** A Machine Learning-Based System for Detecting Fraudulent Job Advertisements and Recruitment Scams  
**Dataset file inspected:** `archive.zip` → `DataSet.csv` (the selected Kaggle Recruitment Scam dataset)  
**Experiment status:** Initial reproducible text-classification baseline completed

## 1. Problem and objective

Online recruitment scams can expose job seekers to financial loss and identity theft. JOBGUARD AI screens the text of a job advertisement and flags advertisements whose wording resembles fraudulent examples in the training data. The output is a risk-screening signal; it is not a legal finding and does not prove an employer is fraudulent.

## 2. Data audit

- Raw dataset: **17,880 rows × 18 columns**.
- Label distribution: **17,014 legitimate (95.16%)** and **866 fraudulent (4.84%)**.
- Exact duplicate rows beyond the first: **235**.
- Repeated title-description rows beyond the first: **1,881**, across **733** repeated title-description groups.
- No conflicting labels were found within the same title-description groups in this audit.
- Missingness is substantial in some fields: salary range 83.96%, department 64.58%, required education 45.33%, benefits 40.25%, and required experience 39.43%.
- HTML tags/entities were cleaned from text. The target was mapped as `f = legitimate (0)` and `t = fraudulent (1)`.

The `in_balanced_dataset` column was excluded because it is dataset metadata and could leak information about dataset construction. The first baseline uses the text fields `title`, `description`, `requirements`, `company_profile`, and `benefits`; metadata features are reserved for a later experiment.

## 3. Methodology

Exact duplicate rows were removed. The data was split by a group key based on title and description so repeated advertisements are not deliberately spread across training, validation, and test sets. Approximate split sizes were 70% training (12,393 rows), 15% validation (2,667 rows), and 15% test (2,585 rows). The split was not perfectly stratified, so class counts are reported explicitly.

A TF-IDF representation using word unigrams was fitted on the training text only (`min_df=3`, `max_df=0.98`, up to 40,000 features). Models compared on the validation set were a majority-class dummy baseline, Multinomial Naive Bayes, and class-weighted Logistic Regression. Logistic Regression was selected by fraudulent-class F1 on validation. A decision threshold of **0.655** was selected using validation data only, then locked before evaluating the test set.

## 4. Validation comparison

| Model | Accuracy | Fraud precision | Fraud recall | Fraud F1 | Average precision |
|---|---:|---:|---:|---:|---:|
| Logistic Regression (balanced) | 97.71% | 77.60% | 87.65% | 82.32% | 0.9321 |
| Multinomial Naive Bayes | 93.63% | 33.33% | 4.94% | 8.60% | 0.4966 |
| Dummy majority baseline | 93.93% | 0.00% | 0.00% | 0.00% | 0.0607 |

These are validation metrics at each model's default decision boundary; the logistic model's final test metrics use the validation-selected threshold.

## 5. Final held-out test results

- **Accuracy:** 98.14%
- **Fraud precision:** 86.14%
- **Fraud recall:** 71.90%
- **Fraud F1:** 78.38%
- **Average precision (PR-AUC summary):** 0.8727
- **ROC-AUC:** 0.9839

Confusion matrix (rows = actual class; columns = predicted class):

| | Predicted legitimate | Predicted fraudulent |
|---|---:|---:|
| Actual legitimate | 2,450 | 14 |
| Actual fraudulent | 34 | 87 |

The model flagged 87 of the 121 fraudulent advertisements in the held-out test split and missed 34. It also flagged 14 legitimate ads for review. This illustrates why both precision and recall matter and why accuracy alone is not sufficient for an imbalanced dataset. Metric definitions follow the scikit-learn evaluation guidance ([precision, recall, F1 and average precision](https://scikit-learn.org/stable/modules/model_evaluation.html)).

## 6. Ethical considerations and limitations

1. **False negatives:** a fraudulent ad may be classified as lower risk. Users should still verify employers independently.
2. **False positives:** a legitimate employer may be flagged. The interface should say “review carefully,” not publicly accuse an employer.
3. **Data age and geography:** this dataset is historical and international. The results do not establish performance on current Kenyan recruitment scams. External validation with trustworthy, appropriately labelled Kenyan examples is needed.
4. **Risk score:** the model's raw logistic-regression score is not guaranteed to be a calibrated real-world probability. The application labels it a model risk score.
5. **Privacy and fairness:** avoid collecting unnecessary personal information, audit performance across relevant groups and job types when reliable data is available, and allow human review.
6. **Dataset bias:** the model can learn patterns in how the historical dataset was collected and labelled, not only genuine scam indicators.

## 7. Next development steps

1. Build a simple responsive interface for pasting job-ad text and showing the screening result.
2. Add transparent signals/limitations and a checklist for verifying the employer.
3. Run a second experiment adding selected structured metadata and compare it on the same grouped split protocol.
4. Consider character n-grams and threshold trade-offs, documenting every experiment.
5. Seek reliable recent examples relevant to Kenya before making claims about local performance.

## 8. Reproducibility

`train_model.py` retrains the baseline from `archive.zip` and writes model/audit artifacts under `artifacts/`. Place the downloaded `archive.zip` in the same directory as the script. `predict_job.py` demonstrates inference using the saved model bundle. The included `jobguard_model.pkl` was produced by the completed initial experiment.
