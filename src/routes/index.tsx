import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/decidefast/dashboard";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Experience — DecideFast" },
    { name: "description", content: "Local workflow connectivity, decision boundaries, and recorded Kev validation benchmarks." },
    { property: "og:title", content: "Experience — DecideFast" },
    { property: "og:description", content: "Your offline decision intelligence workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});
