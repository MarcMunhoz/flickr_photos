export function getPhotoImageUrl(photo) {
  return photo.url_z || photo.url_o || "";
}

export function normalizePhoto(photo) {
  return {
    ...photo,
    imageUrl: getPhotoImageUrl(photo),
  };
}
