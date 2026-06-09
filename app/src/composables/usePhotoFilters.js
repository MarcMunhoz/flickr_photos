import { ref, computed } from "vue";

export function usePhotoFilters() {
  const filters = ref({
    dateFrom: null,
    dateTo: null,
    subject: "",
    owner: "",
    tags: "",
    hideSensitive: false,
  });

  const allPhotos = ref([]);

  /**
   * Filter photos based on active filters
   * @returns {Array} Filtered photos
   */
  const filteredPhotos = computed(() => {
    return allPhotos.value.filter((photo) => {
      // Filter by date range
      if (filters.value.dateFrom || filters.value.dateTo) {
        const photoDate = new Date(photo.datetaken);
        if (filters.value.dateFrom) {
          const fromDate = new Date(filters.value.dateFrom);
          if (photoDate < fromDate) return false;
        }
        if (filters.value.dateTo) {
          const toDate = new Date(filters.value.dateTo);
          // Add one day to include the entire end date
          toDate.setDate(toDate.getDate() + 1);
          if (photoDate >= toDate) return false;
        }
      }

      // Filter by subject/title
      if (filters.value.subject) {
        const titleLower = (photo.title || "").toLowerCase();
        if (!titleLower.includes(filters.value.subject.toLowerCase())) {
          return false;
        }
      }

      // Filter by owner name
      if (filters.value.owner) {
        const ownerLower = (photo.ownername || "").toLowerCase();
        const filterOwnerLower = filters.value.owner.toLowerCase();
        if (ownerLower !== filterOwnerLower) {
          return false;
        }
      }

      // Filter by tags
      if (filters.value.tags) {
        const searchTags = filters.value.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0);

        const photoTags = (photo.tags || "")
          .split(" ")
          .map((tag) => tag.toLowerCase());

        const hasAllTags = searchTags.every((searchTag) =>
          photoTags.some((photoTag) => photoTag.includes(searchTag))
        );

        if (!hasAllTags) return false;
      }

      // Filter by sensitive content
      if (filters.value.hideSensitive) {
        // safety_level: 1 = safe, 2 = moderate, 3 = restricted
        // Also check for tags that indicate adult content
        const safetyLevel = parseInt(photo.safety_level) || 1;
        const isAdult = photo.ispublic === "0" || 
                       (photo.tags && photo.tags.includes("adult")) ||
                       (photo.tags && photo.tags.includes("porn")) ||
                       (photo.tags && photo.tags.includes("nsfw")) ||
                       safetyLevel > 1;
        
        if (isAdult) return false;
      }

      return true;
    });
  });

  /**
   * Check if any filters are active (excluding hideSensitive)
   */
  const hasActiveFilters = computed(() => {
    return (
      filters.value.dateFrom ||
      filters.value.dateTo ||
      filters.value.subject ||
      filters.value.owner ||
      filters.value.tags
    );
  });

  /**
   * Reset all filters to default state (excluding hideSensitive)
   */
  const resetFilters = () => {
    filters.value = {
      dateFrom: null,
      dateTo: null,
      subject: "",
      owner: "",
      tags: "",
      hideSensitive: filters.value.hideSensitive, // Keep the safe preference
    };
  };

  return {
    filters,
    allPhotos,
    filteredPhotos,
    hasActiveFilters,
    resetFilters,
  };
}
