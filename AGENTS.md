<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Prototype state lives in an in-memory React context (src/lib/store.tsx) seeded from src/lib/demo-data.ts — brief requires demo data only, no backend.
- All price math goes through src/lib/pricing.ts mock functions — they are the seam for the authoritative Excel formulas later.
- Proposals store a full PriceSnapshot per version — changing a price book must never alter older or signed estimates.
