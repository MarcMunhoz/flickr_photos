## MODIFIED Requirements

### Requirement: Preferred display URL selection
The application SHALL select the initial display image from a deterministic preference order that favors lightweight public display sizes before larger or original-size URLs.

#### Scenario: Smaller display size is available
- **WHEN** a photo includes `url_n`, `url_m`, `url_s`, `url_z`, and `url_c`
- **THEN** the initial display image MUST use `url_n`

#### Scenario: Preferred size is unavailable
- **WHEN** a photo does not include the preferred image size but includes another supported display URL
- **THEN** the initial display image MUST use the next available URL in the configured preference order

#### Scenario: Only original URL is available
- **WHEN** a photo includes only `url_o` as an image URL
- **THEN** the original URL MAY be used as the display image fallback

### Requirement: Browser image failure fallback
The application SHALL try the next available image candidate when the browser fails to load the current image URL or the current candidate remains pending beyond the application image timeout.

#### Scenario: Current image URL fails with another candidate available
- **WHEN** a photo image emits a browser load error
- **AND** the photo has an untried image candidate
- **THEN** the view MUST update that photo to render the next candidate URL
- **AND** it MUST keep the photo in the gallery

#### Scenario: Current image URL times out with another candidate available
- **WHEN** a photo image candidate has not emitted a successful load event before the application image timeout
- **AND** the photo has an untried image candidate
- **THEN** the view MUST update that photo to render the next candidate URL
- **AND** it MUST keep the photo in the gallery

#### Scenario: All image candidates fail or time out
- **WHEN** every image candidate for a photo has failed or timed out in the browser
- **THEN** the view MUST stop retrying that photo
- **AND** it MUST show a clear unavailable-media state without showing a broken browser image icon

#### Scenario: Recent photo media is unavailable
- **WHEN** every image candidate for a recent public photo has failed or timed out
- **THEN** the recent photos view MUST remove that photo from the visible gallery
- **AND** it SHOULD request more recent-photo metadata when more pages are available
