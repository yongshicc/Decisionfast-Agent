# DecideFast

**Offline Decision Intelligence Agent — Think locally. Decide intelligently.**

Four shared React/TypeScript screens: Command Center, Live Decision, Review Center, and Model Intelligence. No cloud database or AI service. All decision logic stays in your existing n8n workflow.

## Export to your MacBook

In Lovable, open **Settings → GitHub**, connect your account, and connect a repository. Clone that repository on your MacBook. Publishing is not required for local use.

Install Node.js **22.16+** and dependencies while online:

```sh
git clone <your-repository-url>
cd <repository-name>
npm install
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

## Production local / offline execution

```sh
npm run build:local
npm run start:local
```

Open **http://127.0.0.1:3000**. The standalone Node server serves `dist-local` and proxies n8n. Keep Node, n8n, and MLX running; internet is not needed after dependencies are installed. Fonts/icons are physically bundled. Use `build:local` for the MacBook; the normal build remains the hosted preview build. Do not commit generated `dist-local` output.

The local production build uses a controlled PWA app-shell cache with network-first HTML. Development and hosted previews do not register a worker. API responses and complaints are never cached. `?sw=off` disables registration. An offline app shell does not replace your running local proxy, n8n, and model. Test the intended deployment by disconnecting Wi-Fi, not by browser offline simulation (which also disables localhost requests).

## Integrity

- Hosted preview cannot reach your MacBook. Never expose or tunnel the unauthenticated review API publicly.
- Proxy only accepts loopback targets and local host/origin headers. Production binds to 127.0.0.1.
- Counts appear only from real history. Performance numbers are recorded validation observations.
- Same 1,000 NHTSA records, 98 positives; not independent final holdout. Recall decreased and latency increased after tuning.
- Validation thresholds 0.01 and 0.99: 74.4% coverage, 25.6% review, approximately 1.34% routing error, 7 auto-NO false negatives, 3 auto-YES false positives. Not production safety guarantees.
- Model-assisted routing is not confirmed vehicle defect diagnosis. n8n owns 72-hour review expiration.

## Verification

```sh
npm test
node --test scripts/local-proxy.test.mjs
```

The user's MacBook inference is not verifiable from hosted preview. Proxy tests use explicit test fixtures, not live model evidence.
