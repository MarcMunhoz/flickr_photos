import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import FlickrRecentPhotos from "./FlickrRecentPhotos.vue";

const { recentState } = vi.hoisted(() => ({
  recentState: {
    allPhotos: null,
    removePhoto: vi.fn(),
    loadNextPage: vi.fn(),
    cancelLoading: vi.fn(),
  },
}));

vi.mock("@/composables/useRecentPhotos.js", () => ({
  useRecentPhotos: () => ({
    allPhotos: recentState.allPhotos,
    error: ref(""),
    hasMore: computed(() => false),
    isLoading: ref(false),
    loadNextPage: recentState.loadNextPage,
    removePhoto: recentState.removePhoto,
    cancelLoading: recentState.cancelLoading,
  }),
}));

describe("FlickrRecentPhotos", () => {
  beforeEach(() => {
    recentState.allPhotos = ref([
      {
        id: "photo-1",
        title: "Fallback photo",
        ownername: "Alice",
        safety_level: "1",
        imageUrl: "bad.jpg",
        imageCandidates: ["bad.jpg", "good.jpg"],
      },
    ]);
    recentState.removePhoto.mockReset();
    recentState.loadNextPage.mockReset();
    recentState.cancelLoading.mockReset();
  });

  it("tries the next image candidate when the current recent photo image fails", async () => {
    const wrapper = mount(FlickrRecentPhotos, {
      global: {
        stubs: {
          VueDatePicker: true,
        },
      },
    });

    expect(wrapper.get(".photo-placeholder").text()).toContain("Fallback photo");
    expect(wrapper.get("img.gallery-image").attributes("src")).toBe("bad.jpg");

    await wrapper.get("img.gallery-image").trigger("error");

    expect(wrapper.get("img.gallery-image").attributes("src")).toBe("good.jpg");
    expect(recentState.removePhoto).not.toHaveBeenCalled();
  });

  it("shows an unavailable media state after all image candidates fail", async () => {
    const wrapper = mount(FlickrRecentPhotos, {
      global: {
        stubs: {
          VueDatePicker: true,
        },
      },
    });

    await wrapper.get("img.gallery-image").trigger("error");
    await wrapper.get("img.gallery-image").trigger("error");

    expect(wrapper.find("img.gallery-image").exists()).toBe(false);
    expect(wrapper.get(".photo-placeholder").text()).toBe("Image unavailable");
    expect(recentState.removePhoto).not.toHaveBeenCalled();
  });

  it("opens the modal with the resolved fallback display image", async () => {
    recentState.allPhotos.value[0].url_o = "original.jpg";
    const wrapper = mount(FlickrRecentPhotos, {
      global: {
        stubs: {
          VueDatePicker: true,
        },
      },
    });

    await wrapper.get("img.gallery-image").trigger("error");
    await wrapper.get("img.gallery-image").trigger("load");
    await wrapper.get(".gallery-item a").trigger("click");

    expect(wrapper.get(".modal-image").attributes("src")).toBe("good.jpg");
  });
});
