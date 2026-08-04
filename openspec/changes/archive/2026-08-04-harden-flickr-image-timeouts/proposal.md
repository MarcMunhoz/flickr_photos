## Why

Production can receive valid Flickr metadata while browser requests to `live.staticflickr.com` hang long enough that no `load` or `error` event is emitted promptly. The current placeholder-first rendering prevents broken icons, but it can leave large gray placeholders on screen indefinitely because fallback only advances after browser errors.

## What Changes

- Add application-level timeout handling for each Flickr image candidate.
- Advance to the next image candidate when a candidate times out, not only when the browser emits `error`.
- Prefer smaller public display sizes before larger ones to improve first successful render under slow or unreliable Flickr media delivery.
- Keep stable placeholders while candidates are pending, and show a clear unavailable-media state only after all candidates fail or time out.
- Keep the existing Flickr proxy/API contract unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `flickr-image-loading`: Adds explicit timed fallback behavior for pending image candidates and updates preferred candidate order to favor faster public display sizes.

## Impact

- Affected frontend component: `app/src/components/FlickrPhotoImage.vue`.
- Affected photo utility: `app/src/utils/photo.js`.
- Affected tests: photo utility tests and component tests covering image timeout fallback.
- No API, dependency, credential, or Netlify Function changes are expected.
