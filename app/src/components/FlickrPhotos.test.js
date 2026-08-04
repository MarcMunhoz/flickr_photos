import { mount } from "@vue/test-utils";
import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import FlickrPhotos from "./FlickrPhotos.vue";

vi.mock("@/composables/useUserGallery.js", () => ({
  useUserGallery: () => ({
    photos: ref([
      {
        id: "gallery-1",
        title: "Dance Of The Butterflies",
        imageUrl: "bad.jpg",
        imageCandidates: ["bad.jpg", "good.jpg"],
        datetaken: "2017-06-13 00:00:00",
        tags: "",
      },
    ]),
    ownerName: ref(".bella."),
    currentPage: ref(1),
    totalPages: ref(62),
    error: ref(""),
    isLoading: ref(false),
    hasSearched: ref(true),
    hasPreviousPage: computed(() => false),
    hasNextPage: computed(() => true),
    cancelLoading: vi.fn(),
    goToPage: vi.fn(),
  }),
}));

describe("FlickrPhotos", () => {
  it("shows a photo placeholder while user gallery images have not loaded", () => {
    const wrapper = mount(FlickrPhotos);

    expect(wrapper.get(".user-gallery-grid").exists()).toBe(true);
    expect(wrapper.get(".gallery-photo-link").classes()).not.toContain("d-flex");
    expect(wrapper.get(".photo-placeholder").text()).toContain("Dance Of The Butterflies");
    expect(wrapper.get("img").classes()).toContain("is-hidden");
  });
});
