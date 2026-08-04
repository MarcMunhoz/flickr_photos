## Context

The application already protects Flickr API access behind the same-origin `/api/flickr` proxy and asks Flickr for direct image URLs through the `extras` parameter. Recent photo loading currently requests `url_z` and `url_o`, normalizes each photo to one `imageUrl`, renders that URL, and removes the photo immediately when the browser emits an image error.

The observed failure mode is different from an API failure: metadata requests can succeed while image requests to `live.staticflickr.com` time out, return unavailable media, or fail for a specific size. In that state, the UI can show a blank gallery or a broken modal even though useful photo metadata and alternate image sizes may still exist.

## Goals / Non-Goals

**Goals:**
- Treat Flickr media loading as a separate failure surface from Flickr metadata loading.
- Request and preserve multiple public image sizes returned by Flickr.
- Resolve image display through an ordered fallback list.
- Avoid removing a photo until all known display candidates have failed.
- Keep the modal aligned with the resolved display URL instead of preferring a potentially restricted original URL.
- Add deterministic tests for URL ordering and browser image failure behavior.

**Non-Goals:**
- Do not change Flickr API credentials, proxy allowlist, or server-side key handling.
- Do not add a media caching service, image relay, or CDN proxy.
- Do not authenticate users to access restricted original images.
- Do not guarantee display when Flickr or the user's network cannot reach every returned media host.

## Decisions

1. Request more display-size extras in existing Flickr list calls.

   The app should request a practical set of public display sizes, for example `url_s`, `url_m`, `url_n`, `url_z`, and optionally `url_c`, while keeping `url_o` as metadata for original links when Flickr returns it. This increases the chance that at least one browser-friendly derivative exists without adding one `flickr.photos.getSizes` call per photo.

   Alternative considered: call `flickr.photos.getSizes` after each image failure. That would provide the freshest size list, but it adds network fan-out, latency, rate-limit exposure, and more complex cancellation behavior.

2. Normalize photos to carry ordered image candidates, not only one `imageUrl`.

   `normalizePhoto` should preserve Flickr metadata and add a deterministic display candidate list. The initial `imageUrl` can remain for compatibility, but it should be derived from the first candidate in the preferred order.

   Preferred order should favor moderate display sizes first, such as `url_z`, `url_c`, `url_n`, `url_m`, `url_s`, then `url_o` only as a last display fallback. Originals can be very large or unavailable based on owner settings, so they should not be the first modal source.

   Alternative considered: prefer smallest-to-largest to maximize successful loads. That improves resilience but degrades visual quality unnecessarily when normal medium sizes work.

3. Handle image errors per rendered photo with fallback advancement.

   The recent photos component should track which candidate is currently active for each photo. On `img` error, it should advance to the next candidate. Only after all candidates fail should the view mark the image unavailable or remove the photo, depending on the final UX chosen during implementation.

   The lowest-risk implementation is to mark the photo unavailable with a compact placeholder and keep title/owner metadata visible. Removing remains acceptable only after the app has exhausted all candidates and tests verify the empty state is not misleading.

   Alternative considered: immediately remove broken images as today. That hides broken media but also hides valid metadata and can make successful API responses look empty.

4. Use the resolved display URL for modal previews.

   The modal should open the currently working display URL, not `photo.url_o || photo.imageUrl`. If an original link is available and different, the UI can still use it for an external Flickr/original link, but preview should not prefer a URL class that may be owner-restricted or unavailable.

   Alternative considered: keep original-first preview behavior. That preserves the existing intent of opening the largest image but directly causes the broken modal behavior seen when `url_o` or a larger URL fails.

## Risks / Trade-offs

- More `extras` values increase response payload size slightly -> Keep the set limited to display URLs the app can actually use.
- Some failures are network-wide for `live.staticflickr.com` -> Fallbacks will not help when every Flickr image host request is blocked, so the UI must make media unavailability clear.
- Re-rendering on image errors can loop if fallback state is not bounded -> Store attempted candidate indexes per photo and stop after the list is exhausted.
- Original URLs may be unavailable even when smaller URLs work -> Treat originals as optional external targets, not primary display URLs.

## Migration Plan

1. Update photo normalization utilities and tests to expose ordered image candidates.
2. Update recent and user-gallery Flickr requests to include the selected public image-size extras.
3. Update recent photo rendering and modal behavior to advance through candidates on image errors.
4. Add or update Cypress coverage with deterministic fixtures that include multiple image URLs and simulated image failures.
5. Validate with unit tests, E2E tests, and a manual browser smoke check against live Flickr data when network access is available.

Rollback is straightforward: revert the frontend changes to the previous single `imageUrl` behavior. The proxy and production environment configuration are not expected to change.

## Open Questions

- Should exhausted images remain as metadata placeholders, or should they be removed after all candidates fail?
- Should the home/user gallery adopt the same visible placeholder behavior immediately, or only share URL candidate normalization while keeping the current display layout?
