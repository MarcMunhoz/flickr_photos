/**
 * Selects the preferred display URL while retaining the original-size fallback.
 */
export function getPhotoImageUrl(photo) {
  return photo.url_z || photo.url_o || "";
}

/**
 * Adds the application-level imageUrl field without discarding Flickr metadata.
 */
export function normalizePhoto(photo) {
  return {
    ...photo,
    imageUrl: getPhotoImageUrl(photo),
  };
}
