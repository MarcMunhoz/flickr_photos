## Context

The repository will remain available as a technical reference, but the public product should no longer present itself as an active Flickr browser. The last production-facing state should be a static explanation that does not call Flickr, does not show stale placeholders, and does not invite users into broken workflows.

## Goals / Non-Goals

**Goals:**
- Make `/` a complete, polished archive notice.
- Keep the public custom domain alive without requiring Flickr availability.
- Provide a clear link to the repository.
- Keep implementation small and deployable through the current Netlify setup.

**Non-Goals:**
- Do not build a replacement gallery.
- Do not fetch or embed live Flickr photos.
- Do not delete historical components or tests unless required by the archive page.
- Do not archive the GitHub repository from code; that remains a separate GitHub action.

## Decisions

1. Use a dedicated `ArchiveNotice` component as the only active route content.

   This isolates the final public experience without deleting the historical gallery implementation. The router can redirect all paths to `/`, so old route URLs land on the archive notice.

2. Remove interactive navigation from the archived public UI.

   A search box, recent-photo link, and about link imply the product is still active. The archive page should provide one clear external action: view the source repository.

3. Use local CSS visuals, not Flickr-hosted media.

   The page should not depend on the external service that caused the shutdown. A restrained "retired light table" visual built with CSS communicates the subject without network media.

## Risks / Trade-offs

- Keeping old gallery code can confuse future maintainers -> The README and archive page explicitly state the project is archived.
- Redirecting old routes removes deep-link behavior -> The product is intentionally discontinued, so preserving broken routes is not valuable.
- Static page may look less rich than a photo gallery -> Reliability and honesty are more important than decorative live media.

## Migration Plan

1. Add the archive notice component and route it as the only public page.
2. Simplify navigation for archived mode.
3. Add tests confirming the archive page renders and no Flickr search UI is shown.
4. Validate unit tests, build, and OpenSpec.
