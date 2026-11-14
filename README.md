# DecideFast

**Offline Decision Intelligence Agent — Think locally. Decide intelligently.**

DecideFast is a local-first decision-support interface for routing vehicle complaints with a fine-tuned Kev 0.8B model. It combines local inference, selective automation, and human review without sending complaint data to a cloud AI service.

The application provides four React/TypeScript screens: Command Center, Live Decision, Review Center, and Model Intelligence. It does not diagnose vehicle defects; it presents model-assisted routing decisions and preserves human oversight for uncertain cases.

## Architecture

```text
React + TypeScript frontend (127.0.0.1:3000)
                    |
                    | loopback-only /api proxy
                    v
             n8n workflows (:5678)
                    |
                    | local inference
                    v
              Kev 0.8B / MLX (:8010)
```

- **Frontend:** React 19, TypeScript, TanStack Router, Tailwind CSS, and Recharts-compatible UI primitives.
- **Workflow orchestration:** n8n owns validation, model invocation, routing thresholds, review creation, and audit history.
- **Inference:** fine-tuned Kev 0.8B served locally through MLX on Apple Silicon.
- **Human review:** uncertain results are routed to the existing n8n review workflow. DecideFast does not implement a second approval system.
- **Local transport:** the Node/Vite proxy accepts only loopback hosts and forwards unchanged complaint JSON to production n8n webhook paths.
- **Offline shell:** the local production build generates a PWA app shell. API responses and complaint data are never cached.

## Local setup

Install Node.js **22.16 or later** and the JavaScript dependencies while internet access is available:

```sh
git clone <your-repository-url>
cd <repository-name>
npm ci
cp .env.example .env
npm run dev:local
```

Open **http://127.0.0.1:3000**. The local server binds only to your machine. `.env` configures `N8N_BASE_URL=http://127.0.0.1:5678`; never add private credentials or commit `.env`.

## Connect your existing workflow

1. Start your existing MLX/Kev service on port 8010.
2. Start n8n on port 5678 and **publish** the existing decision and review-history workflows.
3. Confirm production webhook paths `decidefast-offline-decision` and `decidefast-review-history`, not editor test URLs.
4. Click **Recheck**. Connectivity checks review history without sending a fabricated complaint. Kev availability remains unverified until an actual decision succeeds.
5. Submit your own complaint in Live Decision. `/api/decisions` forwards unchanged JSON containing `complaint_id` and `complaint`; `/api/reviews?limit=50` forwards to review history.

The proxy preserves n8n's HTTP status and body, including 202 and 400/502/503/504. Missing local services produce actionable errors, never fake predictions. Review forms open only actual loopback URLs returned by n8n. Links from a decision are preserved in memory for the open session; reload clears them. No second approval system or reconstructed complaint narratives.

## NHTSA benchmark results

The comparison uses the same 1,000 NHTSA validation records, including 98 positive cases. It is a validation comparison, not an independent final holdout and not a production safety claim.

| Metric | Original Kev | Fine-tuned Kev | Direction |
|---|---:|---:|---|
| Accuracy | 0.8310 | 0.8960 | Improved |
| Precision | 0.3563 | 0.4824 | Improved |
| Recall | 0.8980 | 0.8367 | Decreased |
| F1 score | 0.5101 | 0.6119 | Improved |
| Average precision | 0.5006 | 0.6521 | Improved |
| ROC-AUC | 0.9164 | 0.9318 | Improved |
| Brier score | 0.1566 | 0.0879 | Improved; lower is better |
| Calibration ECE | 0.2977 | 0.0905 | Improved; lower is better |
| Server p50 latency | 206.1 ms | 237.1 ms | Slower |
| Server p95 latency | 528.0 ms | 601.3 ms | Slower |

At routing thresholds `0.01` and `0.99`, the recorded validation observations are:

- 74.4% automatically routed and 25.6% sent to human review.
- Approximately 1.34% observed auto-routing error.
- 7 Auto-NO false negatives and 3 Auto-YES false positives.

## Offline deployment

```sh
npm run build:local
npm run start:local
```

Open **http://127.0.0.1:3000**. The standalone Node server serves `dist-local` and proxies n8n. Keep Node, n8n, and MLX running; internet is not needed after dependencies are installed. Fonts/icons are physically bundled. Use `build:local` for the MacBook; the normal build remains the hosted preview build. Do not commit generated `dist-local` output.

The local production build uses a controlled PWA app-shell cache with network-first HTML. Development and hosted previews do not register a worker. API responses and complaints are never cached. `?sw=off` disables registration. An offline app shell does not replace your running local proxy, n8n, and model. Test the intended deployment by disconnecting Wi-Fi, not by browser offline simulation (which also disables localhost requests).

## Verification status

### Verified

- Hosted frontend production build completes.
- Local production build completes and generates the service worker and Workbox runtime.
- Strict TypeScript checking completes successfully.
- The application and all four routes render from the local production server.
- The 10 recorded Original Kev versus Fine-tuned Kev metrics render in Model Intelligence.
- English, German, and Simplified Chinese switching updates visible content and the document language.
- Unit/integrity suite passed 13 tests, including benchmark values, API validation, route matching, preview isolation, and review URL restrictions.
- Local proxy suite passed both tests, covering exact request forwarding, review queries, upstream status preservation, and loopback restrictions.
- n8n itself responded successfully to its health endpoint on port 5678 during local verification.

### Not verified end to end

- A real complaint has not been run through the complete frontend → n8n → MLX/Kev path in this submission environment.
- The production review-history webhook was not active during verification, so real review records and a real pending-review form were not exercised.
- Fully disconnected Wi-Fi operation has not been tested with the user's n8n and MLX processes running locally.
- The benchmark dataset and model artifacts are intentionally not included in this frontend repository.

## Limitations and safety

- Hosted preview cannot reach your MacBook. Never expose or tunnel the unauthenticated review API publicly.
- Proxy only accepts loopback targets and local host/origin headers. Production binds to 127.0.0.1.
- Counts appear only from real history. Performance numbers are recorded validation observations.
- Same 1,000 NHTSA records, 98 positives; not independent final holdout. Recall decreased and latency increased after tuning.
- Validation thresholds 0.01 and 0.99: 74.4% coverage, 25.6% review, approximately 1.34% routing error, 7 auto-NO false negatives, 3 auto-YES false positives. Not production safety guarantees.
- Model-assisted routing is not confirmed vehicle defect diagnosis. n8n owns 72-hour review expiration.
- Local services must remain running; the cached app shell alone cannot perform inference or load review history.
- Review links are session-only and restricted to loopback URLs. Reloading the frontend clears remembered links.

## Development verification

```sh
npm run build
npm run build:local
npx tsc --noEmit
npm test
node --test scripts/local-proxy.test.mjs
```

Proxy tests use explicit fixtures, not fabricated live model evidence.
