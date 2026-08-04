<template>
  <span class="photo-frame">
    <span v-if="showPlaceholder" class="photo-placeholder">
      <span class="photo-placeholder-title">{{ placeholderText }}</span>
    </span>
    <img
      v-if="activeSrc && !isUnavailable"
      :class="['photo-image', imageClass, { 'is-hidden': !isLoaded }]"
      :src="activeSrc"
      :title="title"
      :alt="alt"
      loading="lazy"
      @load="handleLoad"
      @error="handleError"
    />
  </span>
</template>

<script>
import { computed, defineComponent, ref, watch } from "vue";

export default defineComponent({
  name: "FlickrPhotoImage",
  props: {
    alt: {
      type: String,
      default: "Flickr photo",
    },
    candidates: {
      type: Array,
      default: () => [],
    },
    imageClass: {
      type: [String, Array, Object],
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  emits: ["resolved"],
  setup(props, { emit }) {
    const activeIndex = ref(0);
    const isLoaded = ref(false);
    const isUnavailable = ref(false);

    const cleanCandidates = computed(() =>
      props.candidates.filter((candidate, index, candidates) => candidate && candidates.indexOf(candidate) === index)
    );
    const activeSrc = computed(() => cleanCandidates.value[activeIndex.value] || "");
    const placeholderText = computed(() => (isUnavailable.value ? "Image unavailable" : props.alt));
    const showPlaceholder = computed(() => !isLoaded.value || isUnavailable.value);

    watch(
      cleanCandidates,
      () => {
        activeIndex.value = 0;
        isLoaded.value = false;
        isUnavailable.value = cleanCandidates.value.length === 0;
      },
      { immediate: true }
    );

    const handleLoad = () => {
      isLoaded.value = true;
      isUnavailable.value = false;
      emit("resolved", activeSrc.value);
    };

    const handleError = () => {
      isLoaded.value = false;

      if (activeIndex.value < cleanCandidates.value.length - 1) {
        activeIndex.value += 1;
        return;
      }

      isUnavailable.value = true;
    };

    return {
      activeSrc,
      handleError,
      handleLoad,
      isLoaded,
      isUnavailable,
      placeholderText,
      showPlaceholder,
    };
  },
});
</script>

<style scoped>
.photo-frame {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-height: inherit;
}

.photo-placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: inherit;
  place-items: center;
  padding: 0.75rem;
  border: 2px solid #d9dee7;
  background: #f4f6f8;
  color: #485465;
  text-align: center;
}

.photo-placeholder-title {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
}

.photo-image {
  display: block;
}

.photo-image.is-hidden {
  position: absolute;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
</style>
