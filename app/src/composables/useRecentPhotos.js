import { computed, ref } from "vue";
import { fetchFlickr, FlickrApiError } from "@/api/flickrApi.js";
import { FLICKR_IMAGE_EXTRAS, normalizePhoto } from "@/utils/photo.js";

/**
 * Owns incremental loading for Flickr's recent public photo stream.
 */
export function useRecentPhotos() {
  const allPhotos = ref([]);
  const currentPage = ref(0);
  const totalPages = ref(1);
  const isLoading = ref(false);
  const error = ref("");

  let activeRequest = null;

  const hasMore = computed(() => currentPage.value < totalPages.value);

  /**
   * Loads the next available page while preventing concurrent or duplicate work.
   */
  const loadNextPage = async () => {
    if (isLoading.value || !hasMore.value) {
      return;
    }

    const nextPage = currentPage.value + 1;
    const request = new AbortController();
    activeRequest = request;
    isLoading.value = true;
    error.value = "";

    try {
      const data = await fetchFlickr(
        {
          method: "flickr.photos.getRecent",
          extras: [...FLICKR_IMAGE_EXTRAS, "date_taken", "owner_name", "tags", "safety_level"],
          per_page: 35,
          page: nextPage,
        },
        { signal: request.signal }
      );

      // Flickr pages can shift as new photos arrive, so IDs are deduplicated locally.
      const existingIds = new Set(allPhotos.value.map((photo) => photo.id));
      const loadedPhotos = (data.photos?.photo || [])
        .map(normalizePhoto)
        .filter((photo) => photo.imageUrl && !existingIds.has(photo.id));

      allPhotos.value.push(...loadedPhotos);
      currentPage.value = Number(data.photos?.page) || nextPage;
      totalPages.value = Number(data.photos?.pages) || currentPage.value;
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        error.value =
          requestError instanceof FlickrApiError
            ? requestError.message
            : "Unable to load recent Flickr photos.";
      }
    } finally {
      if (activeRequest === request) {
        isLoading.value = false;
        activeRequest = null;
      }
    }
  };

  const removePhoto = (photoId) => {
    allPhotos.value = allPhotos.value.filter((photo) => photo.id !== photoId);
  };

  /**
   * Aborts the active request when the recent photos view is destroyed.
   */
  const cancelLoading = () => {
    activeRequest?.abort();
    activeRequest = null;
    isLoading.value = false;
  };

  return {
    allPhotos,
    error,
    hasMore,
    isLoading,
    loadNextPage,
    removePhoto,
    cancelLoading,
  };
}
