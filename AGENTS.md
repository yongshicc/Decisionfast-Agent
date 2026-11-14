<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application architecture
- Keep file-based TanStack routes and shared client-side feature modules; both hosted preview and local SPA use the same interface to avoid diverging behavior.
- Only standalone local scripts and Vite middleware may proxy n8n; bind to loopback and reject remote hosts/origins because review history is unauthenticated.
- Enable local API calls only in the dedicated local Vite configuration; hosted preview must never register the local proxy or infer connectivity from the sandbox's localhost hostname.
- Do not add AI or routing logic to the frontend or proxy; the existing n8n workflow owns validation, inference, review, and audit records.
- Bundle physical fonts and icons in public for offline exports; local PWA uses generateSW and a single guarded registrar, never registering in hosted previews.
- Never cache API responses; review links stay in session memory and are accepted only for loopback URLs to keep complaint data local.

- Keep language selection in a shared browser-safe React context around both hosted and local interfaces; translate presentation only, never API payloads or recorded decisions.
- Use bundled original sculpture imagery and local variable fonts for the editorial experience so offline exports need no remote media.
- Derive research summaries and chart groups from recorded benchmark data, sharing visuals between Research and its client-only presentation dialog to prevent divergent evidence or live-service dependencies.
