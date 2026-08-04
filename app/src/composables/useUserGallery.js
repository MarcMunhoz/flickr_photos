import { computed, ref } from "vue";
import { fetchFlickr, FlickrApiError } from "@/api/flickrApi.js";
import { FLICKR_IMAGE_EXTRAS, normalizePhoto } from "@/utils/photo.js";

// Module-level state lets the navbar search form and Home gallery share one source of truth.
const photos = ref([]);
const ownerName = ref("");
const currentPage = ref(1);
const totalPages = ref(1);
const userId = ref("");
const error = ref("");
const isLoading = ref(false);
const hasSearched = ref(false);

let activeRequest = null;

/**
 * Converts transport and Flickr errors into messages suitable for the gallery UI.
 */
function getErrorMessage(requestError) {
  if (requestError instanceof FlickrApiError) {
    return requestError.message;
  }

  if (requestError instanceof TypeError) {
    return "Connection error. Try again later.";
  }

  return "Unable to load this Flickr gallery.";
}

/**
 * Loads one page for the currently resolved Flickr user.
 */
async function fetchGalleryPage(page, signal) {
  const data = await fetchFlickr(
    {
      method: "flickr.people.getPublicPhotos",
      extras: [...FLICKR_IMAGE_EXTRAS, "tags", "date_taken", "owner_name"],
      page,
      per_page: 12,
      user_id: userId.value,
    },
    { signal }
  );

  const loadedPhotos = (data.photos?.photo || [])
    .map(normalizePhoto)
    .filter((photo) => photo.imageUrl);

  photos.value = loadedPhotos;
  currentPage.value = Number(data.photos?.page) || page;
  totalPages.value = Number(data.photos?.pages) || 1;
  ownerName.value = loadedPhotos[0]?.ownername || ownerName.value;

  if (Number(data.photos?.total) === 0) {
    error.value = "This user doesn't have any public photos.";
  }
}

/**
 * Resolves a username to a Flickr user ID, then loads the first gallery page.
 * Starting a new search cancels the previous request to prevent stale results.
 */
async function searchUserGallery(username) {
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    error.value = "Please type a username.";
    return false;
  }

  activeRequest?.abort();
  const request = new AbortController();
  activeRequest = request;
  isLoading.value = true;
  hasSearched.value = true;
  error.value = "";
  photos.value = [];
  ownerName.value = "";
  currentPage.value = 1;
  totalPages.value = 1;
  userId.value = "";

  try {
    const userData = await fetchFlickr(
      {
        method: "flickr.people.findByUsername",
        username: normalizedUsername,
      },
      { signal: request.signal }
    );

    userId.value = userData.user?.id || "";

    if (!userId.value) {
      throw new FlickrApiError("User not found. Please check the username.");
    }

    await fetchGalleryPage(1, request.signal);
    return true;
  } catch (requestError) {
    if (requestError.name !== "AbortError") {
      photos.value = [];
      error.value = getErrorMessage(requestError);
    }
    return false;
  } finally {
    if (activeRequest === request) {
      isLoading.value = false;
      activeRequest = null;
    }
  }
}

/**
 * Navigates within the active user's known page range.
 */
async function goToPage(page) {
  if (!userId.value || page < 1 || page > totalPages.value || isLoading.value) {
    return;
  }

  const request = new AbortController();
  activeRequest = request;
  isLoading.value = true;
  error.value = "";

  try {
    await fetchGalleryPage(page, request.signal);
  } catch (requestError) {
    if (requestError.name !== "AbortError") {
      error.value = getErrorMessage(requestError);
    }
  } finally {
    if (activeRequest === request) {
      isLoading.value = false;
      activeRequest = null;
    }
  }
}

/**
 * Cancels in-flight work when the consuming view is unmounted.
 */
function cancelLoading() {
  activeRequest?.abort();
  activeRequest = null;
  isLoading.value = false;
}

export function useUserGallery() {
  return {
    photos,
    ownerName,
    currentPage,
    totalPages,
    error,
    isLoading,
    hasSearched,
    hasPreviousPage: computed(() => currentPage.value > 1),
    hasNextPage: computed(() => currentPage.value < totalPages.value),
    searchUserGallery,
    goToPage,
    cancelLoading,
  };
}
