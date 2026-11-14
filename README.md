# DecideFast

**Offline Decision Intelligence Agent — Think locally. Decide intelligently.**

DecideFast is a local-first decision-support system for routing vehicle safety complaints. It combines a Lovable React/TypeScript interface, n8n orchestration, and a locally served fine-tuned Kev 0.8B model. Complaint text remains on the operator's machine while uncertain cases are escalated to a human reviewer.

> **Evaluation scope:** All reported metrics are observations on the same 1,000-record validation dataset, which contains 98 positive examples. They are not results from an independent holdout set and are not production safety guarantees.

## 1. Project Overview

DecideFast demonstrates how a compact language model can support time-sensitive triage without depending on a cloud inference service. The application provides four views—Command Center, Live Decision, Review Center, and Model Intelligence—and keeps the model, workflow engine, audit records, and review loop local.

The system assists with routing; it does **not** diagnose vehicle defects or replace a qualified human decision-maker.

## 2. Problem and Solution

Vehicle complaint queues create a difficult trade-off: manual review is careful but slow, while fully automatic classification can route uncertain or safety-sensitive cases incorrectly. Cloud-hosted models also introduce privacy, connectivity, and data-governance concerns.

DecideFast addresses this with selective automation:

- a fine-tuned Kev 0.8B model scores each complaint locally;
- n8n automatically routes only high-confidence cases;
- ambiguous cases enter a time-bounded human-review path;
- decisions and review outcomes are recorded in a local audit table; and
- the frontend exposes real system state without inventing predictions or review records.

## 3. System Architecture

```text
┌──────────────────────────────────────────────┐
│ Lovable React + TypeScript frontend          │
│ http://127.0.0.1:3000                        │
└──────────────────────┬───────────────────────┘
                       │ loopback-only /api proxy
                       ▼
┌──────────────────────────────────────────────┐
│ n8n workflow engine                          │
│ validation · routing · review · audit        │
│ http://127.0.0.1:5678                        │
└──────────────────────┬───────────────────────┘
                       │ local HTTP inference
                       ▼
┌──────────────────────────────────────────────┐
│ Kev 0.8B / MLX inference service             │
│ http://127.0.0.1:8010                        │
└──────────────────────────────────────────────┘
```

The proxy accepts only loopback hosts and forwards complaint JSON to the existing production webhook paths. n8n—not the browser—owns input validation, model invocation, selective routing, human review, and audit history. API responses and complaint data are never cached by the PWA.

## 4. Repository Structure

```text
Decisionfast-Agent/
├── src/                  # Lovable React/TypeScript application
├── public/               # Offline-safe fonts, icons, and static assets
├── local/                # Local SPA entry point
├── scripts/              # Loopback proxy, local server, and proxy tests
├── notebooks/
│   └── Decisonfast-kev-nhtsa.ipynb
├── workflows/
│   └── DecideFast — Offline Decision Agent (Local Fixed).json
├── README.md
├── package.json
├── package-lock.json
├── vite.config.ts
├── vite.local.config.ts
├── vitest.config.ts
├── tsconfig.json
└── .gitignore
```

Generated builds, dependencies, model weights, datasets, local n8n state, credentials, and virtual environments are intentionally excluded from version control.

## 5. Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TanStack Router, Tailwind CSS, Radix UI, and Recharts
- **Local delivery:** Vite PWA, a standalone Node server, and a loopback-only proxy
- **Workflow orchestration:** n8n webhooks, data tables, branching, waiting, and webhook responses
- **Model:** Kev 0.8B initialized from `jaredpalmer/kev-0.8b` on `Qwen/Qwen3.5-0.8B-Base`
- **Fine-tuning environment:** Kaggle GPU notebook and the Kev training CLI
- **Local inference target:** MLX/Kev service on Apple Silicon
- **Quality checks:** Vitest, Testing Library, TypeScript, ESLint, and Node's test runner

## 6. Kev 0.8B Fine-tuning

The reproducible Kaggle workflow is stored at [`notebooks/Decisonfast-kev-nhtsa.ipynb`](notebooks/Decisonfast-kev-nhtsa.ipynb). It prepares 1,000 JSONL training examples and initializes training from the original Kev checkpoint. The recorded training command uses one epoch, a `2e-5` learning rate, batch size 1, gradient accumulation of 8, FP32, checkpointing, and CUDA.

The notebook also starts the original and fine-tuned model servers, evaluates them through the same question interface, and packages the resulting fine-tuned artifact. Model weights are deliberately not committed to this repository.

## 7. NHTSA Benchmark Results

Validation dataset: **1,000 NHTSA complaints, including 98 positives**.

| Metric | Original Kev | Fine-tuned Kev |
| --- | ---: | ---: |
| Accuracy | 0.8310 | 0.8960 |
| Precision | 0.3563 | 0.4824 |
| Recall | 0.8980 | 0.8367 |
| F1 | 0.5101 | 0.6119 |
| Average Precision | 0.5006 | 0.6521 |
| ROC-AUC | 0.9164 | 0.9318 |
| Brier Score | 0.1566 | 0.0879 |
| Calibration ECE | 0.2977 | 0.0905 |
| p50 Latency | 206.1 ms | 237.1 ms |
| p95 Latency | 528.0 ms | 601.3 ms |

Fine-tuning improved accuracy, precision, F1, average precision, ROC-AUC, Brier score, and calibration ECE in this validation run. Recall decreased and latency increased, which is an important operational trade-off rather than a hidden result.

These are validation observations on the same 1,000 records—not independent holdout results, claims of statistical generalization, or production safety guarantees.

## 8. n8n Workflow and Human Review

The latest exported workflow is stored at [`workflows/DecideFast — Offline Decision Agent (Local Fixed).json`](workflows/DecideFast%20%E2%80%94%20Offline%20Decision%20Agent%20%28Local%20Fixed%29.json). It preserves the existing production webhook paths:

- `decidefast-offline-decision`
- `decidefast-review-history`

The decision workflow validates input, calls the local Kev endpoint, validates model output, applies the existing thresholds, records audit data, and either responds immediately or waits for human review. Review links are accepted only for loopback URLs and remain in browser session memory.

At thresholds **0.01** and **0.99**, selective automation covered **74.4%** of the validation set. Among the **744 automatically routed cases**, **10 observed errors** occurred: 7 Auto-NO false negatives and 3 Auto-YES false positives. The remaining 25.6% was routed to review. These figures describe the recorded validation run only.

## 9. Local Installation and Usage

Prerequisites:

- Node.js 22.16 or later
- a local n8n instance on port 5678
- a local Kev/MLX inference service on port 8010

Install dependencies while internet access is available:

```sh
git clone https://github.com/yongshicc/Decisionfast-Agent.git
cd Decisionfast-Agent
npm ci
cp .env.example .env
npm run dev:local
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The default local configuration points `N8N_BASE_URL` to `http://127.0.0.1:5678`; never commit `.env` or add credentials to browser code.

For the production-style offline shell:

```sh
npm run build:local
npm run start:local
```

Import the JSON from `workflows/` into n8n, configure its existing local resources, publish the decision and review-history webhooks, and start the Kev service before submitting a complaint.

## 10. Offline Capabilities and Limitations

After dependencies and required model artifacts have been downloaded, the frontend, proxy, n8n workflow, audit data, and inference service can run on the same machine without a cloud AI service. Fonts and icons are physically bundled, and the local production build generates an offline-capable application shell.

Offline does not mean process-free: Node, n8n, and Kev/MLX must remain running. The cached UI alone cannot infer decisions or load review history. Hosted Lovable previews cannot reach services on the operator's MacBook. The unauthenticated local review API must never be exposed through a public tunnel.

## 11. Reproducibility

The repository contains the frontend lockfiles, the Kaggle fine-tuning notebook, the exact exported n8n workflow, recorded benchmark constants, and automated checks. A clean verification run is:

```sh
npm ci
npm run build
npm run build:local
npx tsc --noEmit
npm test
node --test scripts/local-proxy.test.mjs
```

The notebook expects its dataset to be attached in Kaggle and locates `train.jsonl` under `/kaggle/input`. Datasets and model artifacts are excluded because of size, licensing, privacy, and reproducibility concerns. Reproduce the benchmark with the same data split and environment before comparing new model variants.

## 12. Demo and Screenshots

The interactive demo is the local application at `http://127.0.0.1:3000` after the services above are running. The four presentation-ready views cover live routing, human review, operational status, and benchmark analysis. Repository screenshots can be added here for the final submission gallery without changing the application itself.

Suggested demo sequence:

1. Open Command Center and verify local service status.
2. Submit a complaint in Live Decision.
3. Show an automatic route and an uncertain case entering Review Center.
4. Complete the human-review step in n8n.
5. Open Model Intelligence to explain the benchmark, calibration, coverage, and latency trade-offs.

## 13. Known Limitations

- The benchmark uses a validation set, not an independent final holdout.
- The validation set is relatively small and class-imbalanced (98 positives in 1,000 complaints).
- Fine-tuning reduced observed recall and increased p50/p95 latency.
- End-to-end behavior depends on separately running local n8n and Kev/MLX services.
- Model weights and datasets are not distributed in this repository.
- The system supports routing decisions; it is not a defect diagnosis or production safety certification.
- Human review remains essential for uncertain, novel, or high-consequence cases.
- Review links are session-only; reloading the frontend clears remembered links.
- A fully disconnected deployment must be tested on the target machine with all local services running.

---

Built for an AI Hackathon as a technically credible demonstration of private, selective, human-supervised local decision intelligence.
