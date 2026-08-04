## Why

Flickr API requests can return successful JSON responses while the returned image URLs fail to load in the browser because of unavailable sizes, stale media URLs, CDN/DNS issues, or network blocking. The recent photos view currently removes photos immediately on image load error, which can leave the gallery blank or misleading even when valid photo metadata was loaded.

## What Changes

- Add resilient image loading for Flickr photos by selecting from multiple available Flickr image URL sizes instead of relying only on `url_z` and `url_o`.
- Keep failed image loads visible long enough to try alternate URLs before removing or marking a photo unavailable.
- Make the recent photos modal use the same resolved display URL behavior as the gallery instead of opening a known-failing original URL first.
- Preserve existing proxy behavior and server-side API key handling.
- Add focused tests for URL selection, fallback sequencing, and recent-photo rendering when individual Flickr image URLs fail.

## Capabilities

### New Capabilities
- `flickr-image-loading`: Defines how Flickr photo image URLs are selected, retried, displayed, and handled when media loading fails after metadata loads successfully.

### Modified Capabilities
- `test-coverage-modernization`: Extend test coverage expectations to include resilient Flickr image URL selection and browser image failure behavior.

## Impact

- Affected frontend code:
  - `app/src/utils/photo.js`
  - `app/src/composables/useRecentPhotos.js`
  - `app/src/composables/useUserGallery.js`
  - `app/src/components/FlickrRecentPhotos.vue`
  - related unit and Cypress tests
- Flickr API request shape may add more image URL extras such as smaller or alternate sizes.
- No expected API proxy, deployment, dependency, or secret-management changes.
