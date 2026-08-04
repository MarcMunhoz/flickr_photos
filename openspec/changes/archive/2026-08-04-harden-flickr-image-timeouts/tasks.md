## 1. Candidate Ordering

- [x] 1.1 Add a failing photo utility test proving lightweight display URLs are preferred before larger Flickr sizes.
- [x] 1.2 Update photo candidate ordering so `url_n`, `url_m`, and `url_s` are attempted before larger candidates.

## 2. Timeout Fallback

- [x] 2.1 Add a failing component test proving an unresolved image candidate advances after the configured timeout.
- [x] 2.2 Add a failing component test proving the component stops retrying and shows unavailable media after every candidate times out.
- [x] 2.3 Implement bounded per-candidate timeout fallback in `FlickrPhotoImage`.
- [x] 2.4 Add a failing recent-photos test proving exhausted media is removed and backfilled instead of showing unavailable placeholders.
- [x] 2.5 Emit exhausted-media state from `FlickrPhotoImage` and handle it in the recent photos view.

## 3. Validation

- [x] 3.1 Run focused unit/component tests for photo utilities and `FlickrPhotoImage`.
- [x] 3.2 Run the broader unit test suite.
- [x] 3.3 Validate the OpenSpec change.
