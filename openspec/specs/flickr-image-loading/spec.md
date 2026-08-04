# flickr-image-loading Specification

## Purpose
Define how the application selects, renders, retries, and degrades Flickr photo media when metadata loads successfully but browser image requests fail or are delayed.

## Requirements

### Requirement: Multiple Flickr image candidates
The application SHALL preserve an ordered list of displayable Flickr image URL candidates for each loaded photo when Flickr returns more than one public image size.

#### Scenario: Multiple image sizes are returned
- **WHEN** a Flickr photo response includes multiple image URL extras
- **THEN** the normalized photo MUST include an ordered candidate list containing the available display URLs
- **AND** the normalized photo MUST keep the original Flickr metadata fields unchanged

#### Scenario: No image sizes are returned
- **WHEN** a Flickr photo response does not include any supported image URL field
- **THEN** the normalized photo MUST expose no display image candidate
- **AND** photo-loading flows MUST avoid treating the photo as immediately displayable

### Requirement: Preferred display URL selection
The application SHALL select the initial display image from a deterministic preference order that favors ordinary public display sizes before original-size URLs.

#### Scenario: Medium display size is available
- **WHEN** a photo includes `url_z` and other supported image URLs
- **THEN** the initial display image MUST use `url_z`

#### Scenario: Preferred size is unavailable
- **WHEN** a photo does not include the preferred image size but includes another supported display URL
- **THEN** the initial display image MUST use the next available URL in the configured preference order

#### Scenario: Only original URL is available
- **WHEN** a photo includes only `url_o` as an image URL
- **THEN** the original URL MAY be used as the display image fallback

### Requirement: Placeholder-first image rendering
The application SHALL render a stable placeholder for Flickr photos until the active browser image candidate loads successfully.

#### Scenario: Image candidate has not loaded yet
- **WHEN** a gallery photo has an active image candidate
- **AND** the browser has not emitted a successful image load event for that candidate
- **THEN** the gallery MUST show a stable placeholder instead of a broken image icon or empty area

#### Scenario: Active image candidate loads
- **WHEN** the browser emits a successful image load event for the active candidate
- **THEN** the gallery MUST reveal the loaded image in the photo frame

### Requirement: Browser image failure fallback
The application SHALL try the next available image candidate when the browser fails to load the current image URL.

#### Scenario: Current image URL fails with another candidate available
- **WHEN** a photo image emits a browser load error
- **AND** the photo has an untried image candidate
- **THEN** the view MUST update that photo to render the next candidate URL
- **AND** it MUST keep the photo in the gallery

#### Scenario: All image candidates fail
- **WHEN** every image candidate for a photo has failed in the browser
- **THEN** the view MUST stop retrying that photo
- **AND** it MUST show a clear unavailable-media state without showing a broken browser image icon

### Requirement: Modal preview uses resolved display image
The recent photos modal SHALL preview the currently resolved display image URL for the selected photo.

#### Scenario: User opens a photo after fallback
- **WHEN** a user opens a recent photo after its initial image URL failed and a fallback URL loaded
- **THEN** the modal preview MUST use the working fallback display URL

#### Scenario: Original URL exists
- **WHEN** a recent photo has both an original URL and a resolved display URL
- **THEN** the modal preview MUST NOT prefer the original URL over the resolved display URL unless the original URL has been selected as the current working display candidate

### Requirement: New user searches clear stale gallery state
The public user gallery SHALL clear stale gallery data immediately when a new valid username search starts.

#### Scenario: User searches another username after results are visible
- **WHEN** a public user gallery is already showing photos for one username
- **AND** the user starts a new valid username search
- **THEN** the previous photos and owner heading MUST be cleared before the new Flickr response returns
- **AND** the loading state MUST be shown without displaying stale photos from the previous user
