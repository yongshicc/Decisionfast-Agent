import { createFileRoute } from '@tanstack/react-router';
import { Reviews } from '@/features/decidefast/reviews';
export const Route = createFileRoute('/reviews')({
  head: () => ({ meta: [
    { title: 'Review Center — DecideFast' },
    { name: 'description', content: 'Search and filter real local n8n review history and audit timestamps.' },
    { property: 'og:title', content: 'Review Center — DecideFast' },
    { property: 'og:description', content: 'Human oversight through your existing local review workflow.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Reviews,
});