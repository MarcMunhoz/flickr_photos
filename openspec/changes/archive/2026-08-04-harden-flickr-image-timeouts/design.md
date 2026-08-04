## Context

The application now requests multiple Flickr display URLs and renders a placeholder until the selected candidate loads. This protects the UI from broken image icons, but production evidence shows another failure mode: `live.staticflickr.com` requests can hang long enough that the browser does not emit `load` or `error` promptly. In that state, the component keeps showing the pending placeholder and never advances to smaller fallback URLs.

The Flickr API proxy, Netlify routing, and CSP are working as expected. The fix belongs in client-side media resolution.

## Goals / Non-Goals

**Goals:**
- Advance image fallback when a candidate remains pending past an application-defined timeout.
- Prefer smaller public display sizes first so the first successful render is more likely under slow Flickr media delivery.
- Keep the current stable-placeholder behavior while candidates are pending.
- Stop retrying deterministically after all candidates fail or time out.
- Cover timeout behavior with deterministic component tests.

**Non-Goals:**
- Do not proxy or cache Flickr image bytes through the application.
- Do not change the Netlify Function, API key handling, CSP, or Flickr metadata calls.
- Do not guarantee image display when every Flickr media URL is unreachable from the user's network.
- Do not add a new dependency for image loading.

## Decisions

1. Add a bounded per-candidate timer inside `FlickrPhotoImage`.

   The component already owns candidate advancement for `error` events, so it is the right boundary for pending-image timeout behavior. Each active candidate should start one timer. `load`, `error`, candidate changes, and component unmount should clear the timer. When the timer expires, the component should advance exactly as if that candidate failed.

   Alternative considered: handle timeouts in parent gallery components. That would duplicate logic between recent photos and user galleries and make fallback state harder to keep bounded.

2. Use a configurable timeout prop with a production default.

   A default around 8 seconds is long enough for slow but working image loads while preventing indefinite placeholders. Tests can pass a very small timeout to avoid slow suites.

   Alternative considered: use a hard-coded constant only. That is simpler but makes deterministic tests slower or forces fake timers around a hidden value.

3. Prefer lightweight display URLs first.

   Candidate order should favor `url_n`, `url_m`, `url_s`, then larger `url_z`, `url_c`, and finally `url_o`. This improves first paint probability during Flickr CDN degradation. User-facing visual quality remains acceptable because all candidates are public display images and larger views remain available only if they load.

   Alternative considered: keep `url_z` first for quality. Production showed that larger candidates can leave placeholders hanging before smaller candidates are tried.

## Risks / Trade-offs

- Timeout too short can skip images that would have loaded eventually -> Use a moderate default and keep fallback candidates available.
- Smaller-first ordering can initially show lower-resolution images -> Prefer visible content over empty placeholders during CDN instability.
- Late `load` events from an old candidate could race with a newer candidate -> Only resolve the currently active `src` and clear timers when advancing.
- Every candidate can still fail or time out -> Show the existing unavailable-media state without broken browser image icons.

## Migration Plan

1. Add tests for smaller-first candidate ordering.
2. Add component tests for timeout-driven fallback and timer cleanup behavior.
3. Implement timeout advancement in `FlickrPhotoImage`.
4. Validate unit/component tests and OpenSpec.

Rollback is a frontend-only revert to the previous error-only fallback behavior.

## Open Questions

None.
