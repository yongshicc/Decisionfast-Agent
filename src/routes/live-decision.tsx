import { createFileRoute } from '@tanstack/react-router';
import { LiveDecision } from '@/features/decidefast/decision';
export const Route = createFileRoute('/live-decision')({
  head: () => ({ meta: [
    { title: 'Live Decision — DecideFast' },
    { name: 'description', content: 'Analyze vehicle complaints through your local n8n and Kev inference workflow.' },
    { property: 'og:title', content: 'Live Decision — DecideFast' },
    { property: 'og:description', content: 'Real local inference with transparent probability and human review routing.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: LiveDecision,
});