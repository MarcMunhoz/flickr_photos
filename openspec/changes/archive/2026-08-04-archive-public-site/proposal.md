## Why

The public Flickr gallery no longer provides a reliable production experience because Flickr metadata can load while the corresponding public media remains delayed or unavailable. Keeping the domain online as a static archive notice is clearer than serving a broken gallery or shutting the URL down entirely.

## What Changes

- Replace the interactive Flickr gallery experience with a single public archive notice.
- Stop exposing search, recent photos, filters, and gallery routes in the production UI.
- Avoid live Flickr API or media calls from the archive page.
- Keep the public URL useful as a record of why the project was discontinued.

## Capabilities

### New Capabilities

- `public-archive-page`: Defines the archived public landing page and its no-live-Flickr behavior.

### Modified Capabilities

None.

## Impact

- Affected frontend files: router, navigation, home view, and new archive page component.
- Existing Flickr API proxy code can remain in the repository as historical/reference code.
- No Netlify Function, environment variable, or deployment infrastructure changes are required.
