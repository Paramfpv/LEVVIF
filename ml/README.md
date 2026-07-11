# ML — CRP Prediction from Lifestyle Variables

This folder contains the machine learning pipeline for predicting
C-Reactive Protein (CRP) from lifestyle variables using XGBoost regression.
The trained model is used in the LEWIF FastAPI backend to estimate CRP for
users who lack that lab value, enabling biological age estimation via the
PhenoAge formula.

## Data Source

NHANES (National Health and Nutrition Examination Survey) across three cycles:

| Cycle | Suffix/Prefix | Files |
|---|---|---|
| 2015–2016 | `_I` | 7 XPT files |
| 2017–March 2020 | `P_` | 7 XPT files |
| 2021–2023 | `_L` | 7 XPT files |

Domains: HSCRP, DEMO, BMX, SMQ, SLQ, PAQ, ALQ

## Folder Structure

```
ml/
├── data/
│   ├── raw/          ← NHANES XPT files (not tracked in git)
│   └── processed/    ← Cleaned/merged datasets
├── notebooks/        ← Exploration and training notebooks
├── models/           ← Saved model artifacts
└── README.md
```
