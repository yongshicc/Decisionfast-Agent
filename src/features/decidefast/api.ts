export type DecisionType = 'AUTO_NO' | 'HUMAN_REVIEW' | 'AUTO_YES';
export interface DecisionResult {
  status?: string; request_id?: string; complaint_id?: string; decision: DecisionType;
  probability: number; review_status?: string; review_url?: string; model?: string;
  inference_latency_ms?: number; thresholds?: { auto_no_max: number; auto_yes_min: number };
  queued_at?: string; expires_at?: string;
}
export interface ReviewRow {
  complaint_id?: string; request_id?: string; probability?: number; routing_decision?: string;
  review_status?: string; reviewer_decision?: string; reviewer?: string; human_confirmed?: boolean;
  auto_approved?: boolean; queued_at?: string; reviewed_at?: string; closed_at?: string;
  inference_latency_ms?: number; review_url?: string;
}
export interface ReviewHistory { status?: string; total_matching: number; returned: number; rows: ReviewRow[] }
export class LocalApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function isLocalHost(host: string) { return ['localhost', '127.0.0.1', '[::1]'].includes(host.toLowerCase()); }
export function safeReviewUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try { const u = new URL(value); if (['http:', 'https:'].includes(u.protocol) && isLocalHost(u.hostname)) return u.href; } catch { /* invalid URL */ }
  return undefined;
}
async function request(path: string, init?: RequestInit) {
  if (import.meta.env['VITE_DECIDEFAST_LOCAL'] !== 'true' || !isLocalHost(window.location.hostname)) throw new LocalApiError(0, 'This preview cannot reach your MacBook. Run DecideFast locally with N8N_BASE_URL=http://127.0.0.1:5678.');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 120000);
  try {
    const response = await fetch(path, { ...init, signal: controller.signal });
    const text = await response.text(); let body: unknown;
    try { body = JSON.parse(text); } catch { throw new LocalApiError(response.status, text || 'The local proxy returned an empty response. Check the n8n webhook and proxy configuration.'); }
    if (!response.ok) throw new LocalApiError(response.status, typeof body === 'object' && body ? JSON.stringify(body) : String(body));
    return body;
  } catch (e) { if (e instanceof LocalApiError) throw e; throw new LocalApiError(0, e instanceof Error && e.name === 'AbortError' ? 'Local request timed out after 120 seconds.' : 'Cannot reach the local proxy. Start the local app and confirm n8n is running on port 5678.'); }
  finally { clearTimeout(timer); }
}
export async function analyzeComplaint(complaint_id: string, complaint: string): Promise<DecisionResult> {
  const b = await request('/api/decisions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ complaint_id, complaint }) });
  if (!b || typeof b !== 'object' || !('decision' in b) || !('probability' in b) || !['AUTO_NO','HUMAN_REVIEW','AUTO_YES'].includes(String(b.decision)) || typeof b.probability !== 'number' || !Number.isFinite(b.probability) || b.probability < 0 || b.probability > 1) throw new LocalApiError(502, 'Invalid decision response from n8n. Expected a routing decision and probability between 0 and 1.');
  return b as DecisionResult;
}
export async function fetchReviews(): Promise<ReviewHistory> {
  const b = await request('/api/reviews?limit=50');
  if (!b || typeof b !== 'object' || !('rows' in b) || !Array.isArray(b.rows) || !('returned' in b) || typeof b.returned !== 'number' || !('total_matching' in b) || typeof b.total_matching !== 'number') throw new LocalApiError(502, 'Invalid review history response from n8n. Expected rows, returned, and total_matching.');
  return b as ReviewHistory;
}
