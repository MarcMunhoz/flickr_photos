<template>
  <div>
    <!-- Top Control Bar -->
    <div class="control-bar mb-4">
      <div class="control-bar-content">
        <!-- Safe Content Toggle -->
        <div class="safe-content-toggle">
          <button
            :class="['toggle-btn', { active: filters.hideSensitive }]"
            @click="filters.hideSensitive = !filters.hideSensitive"
            :title="filters.hideSensitive ? 'Hiding sensitive content' : 'Showing all content'"
          >
            <span class="toggle-icon">🛡️</span>
            <span class="toggle-label">Safe Only</span>
            <span :class="['toggle-badge', { on: filters.hideSensitive }]"></span>
          </button>
        </div>

        <!-- Filters Button -->
        <button
          class="btn btn-light text-start d-flex justify-content-between align-items-center filter-btn"
          type="button"
          @click="showFilters = !showFilters"
        >
          <span>
            🔍 Filters
            <span v-if="hasActiveFilters" class="badge bg-primary ms-2">{{ activeFilterCount }}</span>
          </span>
          <i :class="['bi', showFilters ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
        </button>
      </div>
    </div>

    <!-- Collapsible Filter Panel -->
    <div class="filter-section mb-4">
      <div v-if="showFilters" class="filter-panel">
        <div class="filter-panel-header">
          <div>
            <span class="filter-eyebrow">Refine results</span>
            <h2>Find the photos you want</h2>
          </div>
          <span class="result-summary">
            <strong>{{ filteredPhotos.length }}</strong>
            of {{ allPhotos.length }} photos
          </span>
        </div>

        <div class="filter-panel-body">
          <!-- Date Range Filter -->
          <div class="date-filter-card">
            <div class="filter-field-heading">
              <label class="form-label">Date range</label>
              <span>Filter by the date the photo was taken</span>
            </div>
            <VueDatePicker
              v-model="dateRange"
              range
              :partial-range="false"
              multi-calendars
              format="dd/MM/yyyy"
              placeholder="Choose a start and end date"
              :enable-time-picker="false"
              input-class-name="date-picker-input"
            />
          </div>

          <div class="filter-grid">
            <!-- Subject/Title Filter -->
            <div class="filter-field">
              <label for="subject" class="form-label">Subject or title</label>
              <input
                type="text"
                id="subject"
                v-model="filters.subject"
                class="form-control"
                placeholder="For example: landscape"
              />
            </div>

            <!-- Owner Name Filter -->
            <div class="filter-field">
              <label for="owner" class="form-label">Publisher</label>
              <select
                id="owner"
                v-model="filters.owner"
                class="form-select"
              >
                <option value="">All publishers</option>
                <option v-for="author in uniqueAuthors" :key="author" :value="author">
                  {{ author }}
                </option>
              </select>
            </div>

            <!-- Tags Filter -->
            <div class="filter-field">
              <label for="tags" class="form-label">Tags</label>
              <input
                type="text"
                id="tags"
                v-model="filters.tags"
                class="form-control"
                placeholder="nature, travel, city"
              />
            </div>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="filter-panel-footer">
          <span class="active-filter-summary">
            {{ activeFilterCount ? `${activeFilterCount} active filter(s)` : "No filters applied" }}
          </span>
          <button
            v-if="activeFilterCount > 0"
            @click="clearFilters"
            class="clear-filters-btn"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>

    <!-- Gallery -->
    <div v-if="filteredPhotos.length > 0" class="gallery-container">
      <div v-for="(photo, index) in filteredPhotos" :key="photo.id" class="gallery-item" :style="getGridStyles(index)">
        <a
          :href="photo.url_o"
          target="_recent"
          @mouseover="bordered(true, $event.target, photo.url_o)"
          @mouseleave="bordered(false, $event.target, photo.url_o)"
          @click="openModal($event, photo.url_o, photo.title, photo.ownername)"
        >
          <img :src="photo.imageUrl" :title="`${photo.title ? photo.title : ''} by ${photo.ownername} `" loading="lazy" class="border-4 border-unicorn gallery-image" @error="handleImageError(photo.id)" />
        </a>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="allPhotos.length > 0" class="empty-state">
      <p class="text-muted">No photos found with the selected filters.</p>
    </div>

    <!-- Modal for Larger View -->
    <div
      v-if="showModal"
      class="modal bg-black d-flex flex-wrap justify-content-center align-items-center position-fixed top-0 start-0 h-100 w-100"
      style="--bs-bg-opacity: 0.8; font-family: var(--bs-body-font-family)"
      @click="showModal = false"
    >
      <img :src="currentPhoto" alt="Large view" class="modal-image" />
      <p class="text-light fs-4 w-100">
        <span v-if="currentPhotoTitle.length">{{ currentPhotoTitle }} - </span>by <span class="gradient-flickr text-uppercase">{{ currentPhotoOwner }}</span>
      </p>
    </div>

    <!-- Back to Top Button -->
    <button
      v-if="showBackToTop"
      @click="scrollToTop"
      class="back-to-top-btn"
      title="Back to top"
    >
      ↑
    </button>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { fetchData, theDate, bordered } from "@/utils/usefulFunctions.js";
import { usePhotoFilters } from "@/composables/usePhotoFilters.js";

export default defineComponent({
  name: "RecentPhotos",
  setup() {
    // Use the photo filters composable
    const { filters, allPhotos, filteredPhotos, hasActiveFilters, resetFilters } = usePhotoFilters();

    // UI state
    const showFilters = ref(false);
    const showBackToTop = ref(false);

    // Date range state
    const dateRange = ref(null);

    // Modal state
    const showModal = ref(false);
    const currentPhoto = ref(null);
    const currentPhotoTitle = ref(String);
    const currentPhotoOwner = ref(String);

    /**
     * Sync dateRange with filters.dateFrom and filters.dateTo
     */
    watch(dateRange, (newRange) => {
      const [dateFrom, dateTo] = Array.isArray(newRange) ? newRange : [];
      filters.value.dateFrom = dateFrom || null;
      filters.value.dateTo = dateTo || null;
    });

    const clearFilters = () => {
      dateRange.value = null;
      resetFilters();
    };

    /**
     * Count how many filters are currently active (excluding hideSensitive)
     */
    const activeFilterCount = computed(() => {
      let count = 0;
      if (filters.value.dateFrom || filters.value.dateTo) count++;
      if (filters.value.subject) count++;
      if (filters.value.owner) count++;
      if (filters.value.tags) count++;
      return count;
    });

    /**
     * Get unique authors from loaded photos
     */
    const uniqueAuthors = computed(() => {
      const authors = new Set(
        allPhotos.value
          .map((photo) => photo.ownername)
          .filter((name) => name && name.trim().length > 0)
      );
      return Array.from(authors).sort();
    });

    // Open modal with the selected image
    const openModal = (evt, src, title, owner) => {
      evt.preventDefault();
      currentPhoto.value = src;
      currentPhotoTitle.value = title;
      currentPhotoOwner.value = owner;
      src && (showModal.value = true);
    };

    // Grid layout styles for mosaic effect
    const getGridStyles = (index) => {
      const spans = [
        { gridColumn: "span 2", gridRow: "span 2" },
        { gridColumn: "span 1", gridRow: "span 1" },
        { gridColumn: "span 1", gridRow: "span 2" },
        { gridColumn: "span 2", gridRow: "span 1" },
      ];
      return spans[index % spans.length];
    };

    // Fetch configuration
    let rawData = Object;
    let currentPage = ref(1);
    let fetchParams = {
      method: "flickr.photos.getRecent",
      extras: ["url_z", "url_o", "date_taken", "owner_name", "tags", "safety_level"],
      per_page: 35,
      page: 1,
    };

    /**
     * Fetch recent photos from Flickr API
     */
    const fetchRecent = async (pageNum = 1) => {
      try {
        fetchParams.page = pageNum;
        rawData = await fetchData(fetchParams);

        if (rawData.photos && rawData.photos.photo) {
          for (let index = 0; index < rawData.photos.photo.length; index++) {
            const photo = rawData.photos.photo[index];
            if (photo.url_z || photo.url_o) {
              photo.imageUrl = photo.url_z || photo.url_o;
              allPhotos.value.push(photo);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
      }
    };

    /**
     * Handle failed image loads by removing from collection
     */
    const handleImageError = (photoId) => {
      allPhotos.value = allPhotos.value.filter((photo) => photo.id !== photoId);
    };

    /**
     * Handle infinite scroll loading and back-to-top visibility
     */
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      // Show/hide back to top button
      showBackToTop.value = scrollTop > 300;

      // Disable infinite scroll when filters are active
      if (hasActiveFilters.value) return;

      if (scrollTop + clientHeight >= scrollHeight - 5) {
        currentPage.value += 1;
        fetchRecent(currentPage.value);
      }
    };

    /**
     * Scroll back to top
     */
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

    onMounted(() => {
      fetchRecent();
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      allPhotos,
      filteredPhotos,
      filters,
      hasActiveFilters,
      activeFilterCount,
      uniqueAuthors,
      clearFilters,
      dateRange,
      theDate,
      bordered,
      showFilters,
      showBackToTop,
      showModal,
      currentPhoto,
      currentPhotoTitle,
      currentPhotoOwner,
      openModal,
      getGridStyles,
      currentPage,
      handleImageError,
      scrollToTop,
    };
  },
});
</script>

<style scoped>
.control-bar {
  width: 90%;
  margin: 0 auto 1rem;
  position: sticky;
  top: 0;
  z-index: 101;
  padding: 0.75rem 0;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
}

.control-bar-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e6e9ef;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(33, 37, 41, 0.08);
}

.safe-content-toggle {
  flex-shrink: 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.55rem 0.9rem;
  background: #f4f6f8;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 600;
  color: #495057;
}

.toggle-btn:hover {
  background: #e9ecef;
}

.toggle-btn.active {
  background: #198754;
  color: white;
  border-color: #198754;
}

.toggle-icon {
  font-size: 1.2rem;
}

.toggle-label {
  font-size: 0.9rem;
}

.toggle-badge {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #dee2e6;
  transition: all 0.2s ease;
  margin-left: 0.25rem;
}

.toggle-badge.on {
  background-color: white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.filter-btn {
  flex: 1;
  min-height: 44px;
  border: 0;
  border-radius: 10px;
  padding: 0.65rem 1rem;
  background: #f4f6f8;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 600;
  color: #343a40;
}

.filter-btn:hover {
  background: #e9ecef;
}

.filter-section {
  width: 90%;
  margin: 0 auto 2rem;
  position: sticky;
  top: 76px;
  z-index: 102;
}

.filter-panel {
  overflow: visible;
  background: #fff;
  border: 1px solid #e4e8ee;
  border-radius: 16px;
  box-shadow: 0 18px 45px rgba(31, 41, 55, 0.14);
  color: #2c3440;
  font-family: Arial, Helvetica, sans-serif;
}

.filter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
}

.filter-eyebrow {
  display: block;
  margin-bottom: 0.2rem;
  color: #0d6efd;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-panel-header h2 {
  margin: 0;
  color: #202733;
  font-size: 1.15rem;
  font-weight: 700;
}

.result-summary {
  flex-shrink: 0;
  padding: 0.55rem 0.75rem;
  background: #f3f6fb;
  border-radius: 999px;
  color: #687180;
  font-size: 0.78rem;
}

.result-summary strong {
  color: #0d6efd;
  font-size: 0.95rem;
}

.filter-panel-body {
  display: grid;
  gap: 1.25rem;
  padding: 1.5rem;
}

.date-filter-card {
  padding: 1rem;
  background: linear-gradient(135deg, #f7faff, #f4f6fb);
  border: 1px solid #dfe8f7;
  border-radius: 12px;
  text-align: left;
}

.filter-field-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.65rem;
}

.filter-field-heading span {
  color: #7a8492;
  font-size: 0.75rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.filter-field {
  min-width: 0;
  text-align: left;
}

.filter-panel .form-label {
  display: block;
  margin-bottom: 0.4rem;
  color: #364152;
  font-size: 0.78rem;
  font-weight: 700;
}

.filter-panel .form-control,
.filter-panel .form-select {
  min-height: 44px;
  border-color: #d9dee7;
  border-radius: 9px;
  color: #343a40;
  font-size: 0.875rem;
}

.filter-panel .form-control:focus,
.filter-panel .form-select:focus {
  border-color: #6ea8fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

:deep(.date-picker-input) {
  min-height: 46px !important;
  background-color: white !important;
  border: 1px solid #d9dee7 !important;
  border-radius: 9px !important;
  padding: 0.65rem 2.75rem !important;
  font-size: 0.875rem !important;
  color: #343a40 !important;
  font-family: Arial, Helvetica, sans-serif !important;
}

:deep(.date-picker-input:focus) {
  border-color: #6ea8fe !important;
  outline: 0 !important;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12) !important;
}

:deep(.dp__input_icon) {
  left: 0.85rem;
  width: 18px;
  height: 18px;
  color: #6c7888;
}

:deep(.dp__clear_icon) {
  right: 0.85rem;
}

:deep(.dp__menu) {
  overflow: hidden;
  border: 1px solid #dfe3ea;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(31, 41, 55, 0.2);
  font-family: Arial, Helvetica, sans-serif;
}

:deep(.dp__action_select) {
  background: #0d6efd;
}

.filter-panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  background: #fafbfc;
  border-top: 1px solid #edf0f4;
  border-radius: 0 0 16px 16px;
}

.active-filter-summary {
  color: #7a8492;
  font-size: 0.78rem;
}

.clear-filters-btn {
  padding: 0.45rem 0.85rem;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 8px;
  color: #495057;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  border-color: #0d6efd;
  color: #0d6efd;
}

.empty-state {
  width: 90%;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.gallery-container {
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-rows: 150px;
  gap: 5px;
  margin: 0 auto;
  width: 90%;
}

.gallery-item {
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
}

.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #0d6efd;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
  z-index: 99;
}

.back-to-top-btn:hover {
  background-color: #0b5ed7;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(13, 110, 253, 0.4);
}

.back-to-top-btn:active {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .control-bar {
    width: calc(100% - 1.5rem);
  }

  .control-bar-content {
    flex-direction: column;
  }

  .safe-content-toggle {
    width: 100%;
  }

  .toggle-btn {
    width: 100%;
    justify-content: center;
  }

  .filter-btn {
    width: 100%;
  }

  .filter-section {
    position: relative;
    top: auto;
    width: calc(100% - 1.5rem);
  }

  .filter-panel-header {
    align-items: flex-start;
    padding: 1rem;
  }

  .result-summary {
    max-width: 45%;
    white-space: nowrap;
  }

  .filter-panel-body {
    padding: 1rem;
  }

  .filter-field-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.1rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-panel-footer {
    padding: 0.85rem 1rem;
  }

  :deep(.dp__menu) {
    max-width: calc(100vw - 2rem);
  }

  .gallery-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    grid-auto-rows: 100px;
  }

  .back-to-top-btn {
    width: 45px;
    height: 45px;
    bottom: 1.5rem;
    right: 1.5rem;
    font-size: 1.2rem;
  }
}
</style>
