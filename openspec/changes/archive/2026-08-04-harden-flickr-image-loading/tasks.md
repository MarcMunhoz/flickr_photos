## 1. Photo URL Normalization

- [x] 1.1 Add photo utility tests for ordered Flickr image candidates across `url_z`, `url_c`, `url_n`, `url_m`, `url_s`, and `url_o`.
- [x] 1.2 Update `app/src/utils/photo.js` to preserve metadata while exposing ordered image candidates and a compatibility `imageUrl`.
- [x] 1.3 Verify photos without supported image URL fields remain non-displayable.

## 2. Flickr Request Shape

- [x] 2.1 Update recent photo requests to ask Flickr for the selected display-size extras.
- [x] 2.2 Update user gallery requests to ask Flickr for the same display-size extras where applicable.
- [x] 2.3 Add or update composable tests to verify the requested extras and loaded-photo filtering behavior.

## 3. Recent Photo Fallback UI

- [x] 3.1 Add recent photo component coverage or E2E coverage for an image failing over from one candidate URL to the next.
- [x] 3.2 Implement bounded per-photo fallback state so image load errors advance through untried candidates without retry loops.
- [x] 3.3 Decide and implement the exhausted-candidates behavior: unavailable-media placeholder or removal without misleading filter-empty UI.
- [x] 3.4 Update modal opening so previews use the currently resolved display URL instead of preferring `url_o`.

## 4. Regression Coverage

- [x] 4.1 Update deterministic Cypress fixtures to include multiple Flickr image URL sizes.
- [x] 4.2 Add or update Cypress recent-photo coverage for fallback rendering and modal preview behavior.
- [x] 4.3 Confirm existing recent-photo filtering and incremental loading tests still pass with the expanded fixture shape.

## 5. Validation

- [x] 5.1 Run unit tests in the project container.
- [x] 5.2 Run Cypress or the documented E2E validation in the project container.
- [x] 5.3 Run OpenSpec validation for `harden-flickr-image-loading`.
- [x] 5.4 Perform a manual browser smoke check against live Flickr data when network access is available, recording whether failures are URL-specific or network-wide.
