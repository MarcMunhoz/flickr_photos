export const FLICKR_IMAGE_EXTRAS = ["url_s", "url_m", "url_n", "url_z", "url_c", "url_o"];

const IMAGE_URL_FIELDS = ["url_z", "url_c", "url_n", "url_m", "url_s", "url_o"];

/**
 * Lists available display URLs in preferred fallback order.
 */
export function getPhotoImageCandidates(photo) {
  const seen = new Set();

  return IMAGE_URL_FIELDS.reduce((candidates, field) => {
    const url = photo[field];

    if (url && !seen.has(url)) {
      seen.add(url);
      candidates.push(url);
    }

    return candidates;
  }, []);
}

/**
 * Selects the preferred display URL while retaining the original-size fallback.
 */
export function getPhotoImageUrl(photo) {
  return getPhotoImageCandidates(photo)[0] || "";
}

/**
 * Adds the application-level imageUrl field without discarding Flickr metadata.
 */
export function normalizePhoto(photo) {
  const imageCandidates = getPhotoImageCandidates(photo);

  return {
    ...photo,
    imageCandidates,
    imageUrl: imageCandidates[0] || "",
  };
}
