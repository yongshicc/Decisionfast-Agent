import { createFileRoute } from '@tanstack/react-router';
import { Intelligence } from '@/features/decidefast/intelligence';
export const Route = createFileRoute('/model-intelligence')({
  head: () => ({ meta: [
    { title: 'Model Intelligence — DecideFast' },
    { name: 'description', content: 'Original and fine-tuned Kev validation metrics, selective automation, and measured trade-offs.' },
    { property: 'og:title', content: 'Model Intelligence — DecideFast' },
    { property: 'og:description', content: 'Measured validation observations, not production safety guarantees.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Intelligence,
});