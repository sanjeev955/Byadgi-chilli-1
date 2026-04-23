# Chilli Quality Grading System Report - TODO

## Project Overview
ML-based web app for automatic chilli quality grading (DHQ, DLQ, KHQ, KLQ classes).
- CNN model trained on ChilliDataset (train/test folders).
- Features: Disease detection, grading via color/length/wrinkle analysis.
- Tech: TensorFlow/Keras CNN, OpenCV, Flask backend API, Next.js frontend with grading tool.

## Report Requirements Checklist (Based on TOC)

### 1. INTRODUCTION
- [ ] 1.1 Motivation: Write about chilli quality grading need in agriculture/export (use images/chilli-hero.jpg).
- [ ] 1.2 Objectives: Automate grading, improve accuracy over manual.
- [ ] 1.3 Problem Statement & Analysis: Manual grading inconsistencies; dataset issues (HEIC conversion).
- [ ] 1.4 Literature Review: Cite CNN for plant disease (5-10 refs).
- [ ] 1.5 Research Gap & Scope: Focus on 4 chilli classes; constraints (64x64 images).

### 2. PROPOSED SYSTEM
- [ ] 2.1 Overview: Web app flow (upload → model predict → grade).
- [ ] 2.2 System Architecture: Draw block diagram (Frontend → API → CNN model → Results). Use draw.io/export PNG.
- [ ] 2.2.1 Explanation: Layers, data flow.
- [ ] 2.3 Target Users: Farmers, exporters, quality inspectors.
- [ ] 2.4 Advantages: Fast, consistent; Applications: Market pricing.
- [ ] 2.5 Scope/Limitations: 4 classes only; lighting dependency.

### 3. SOFTWARE REQUIREMENT SPECIFICATION
- [ ] 3.1 Overview.
- [ ] 3.2.1 Functional: Upload image, predict class/quality scores.
- [ ] 3.2.2 Use Case Diagrams: Draw 3-5 cases (login, grade chilli). Use draw.io.
- [ ] 3.2.3 Use Case Descriptions: Scenarios.
- [ ] 3.2.4 Nonfunctional: Response <2s, 95% acc.
- [ ] 3.3.1 Software: Python 3.8+, TF 2.x, Next.js 14, Node 18 (from requirements.txt, package.json).
- [ ] 3.3.2 Hardware: GPU for training (setup_gpu.bat).
- [ ] 3.4 GUI: Screenshots of frontend pages (page.tsx, grading/page.tsx); Navigation flow diagram.

### 4. SYSTEM DESIGN
- [ ] 4.2 Architecture diagram.
- [ ] 4.3 Use Case Diagram.
- [ ] 4.4 User Flow: Sequence diagram.
- [ ] 4.5 Functional Flow.
- [ ] 4.6 ER Diagram: Minimal (Users, Images, Predictions table if DB added).
- [ ] 4.7 Benefits.

### 5. IMPLEMENTATION
- [ ] 5.1 Methodology:
  - [ ] Data: ChilliDataset (train/test, classes from notebook).
  - [ ] Preprocessing: HEIC→JPG (convert_heic.py), resize 64x64, augment.
  - [ ] EDA: Run count_dataset.py for stats; add plots.
  - [ ] Model: CNN details from chilliprojectMain.ipynb (run train_90_gpu.py).
  - [ ] Algorithms: CNN explained; add metrics from evaluate_model.py.
  - [ ] Acc Comparison: Run DT/NB/SVM/LR/RF/XGB on dataset.
  - [ ] Modules: Backend app.py, frontend grading-tool.tsx.
  - [ ] Deployment: Heroku (runtime.txt), ngrok.
- [ ] 5.2 Datasets: Describe ChilliDataset sizes.
- [ ] 5.3 Modules: Code snippets.
- [ ] 5.4 Frontend: Next.js components screenshots.

### 6. TESTING
- [ ] 6.1 Training: History plot (training_history.png).
- [ ] Hyperparam tuning: Log from train_90_gpu.py.
- [ ] Metrics: Acc/prec/rec/F1 from evaluate_model_90.py.
- [ ] Confusion Matrix: Generate from test_model.py.
- [ ] Deployment test.

### 7. RESULTS AND DISCUSSION
- [ ] 7.1 Performance: Tables/charts (acc ~90% from models).
- [ ] 7.2 Algos: CNN best; compare others.
- [ ] 7.3 Comparison table.
- [ ] 7.4 Evaluation.
- [ ] Visuals: Confusion matrices, sample predictions.

### 8. CONCLUSION & REFERENCES

## Required Info/Data to Gather/Generate
- Run `python train_90_gpu.py` → metrics/plots.
- Run `python evaluate_model_90.py` → test results.
- Screenshots: `npm run dev` in frontend/ → all pages.
- Diagrams: Use draw.io for UML (export PNGs to public/images/).
- Dataset stats: Modify count_dataset.py → # images/class.
- Add DB? ER if needed (SQLite for predictions).
- Compete algos: Implement NB/SVM etc. in new notebook.
- LaTeX: Compile with listings for code, graphics.

## Next Steps
1. Complete missing runs/metrics.
2. Generate diagrams/screenshots.
3. Write sections iteratively.
4. Format in LaTeX/Overleaf matching TOC.

Updated: Track progress by checking [x].
