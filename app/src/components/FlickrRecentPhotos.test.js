import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import FlickrRecentPhotos from "./FlickrRecentPhotos.vue";

const { recentState } = vi.hoisted(() => ({
  recentState: {
    allPhotos: null,
    hasMore: null,
    removePhoto: vi.fn(),
    loadNextPage: vi.fn(),
    cancelLoading: vi.fn(),
  },
}));

vi.mock("@/composables/useRecentPhotos.js", () => ({
  useRecentPhotos: () => ({
    allPhotos: recentState.allPhotos,
    error: ref(""),
    hasMore: recentState.hasMore,
    isLoading: ref(false),
    loadNextPage: recentState.loadNextPage,
    removePhoto: recentState.removePhoto,
    cancelLoading: recentState.cancelLoading,
  }),
}));

describe("FlickrRecentPhotos", () => {
  beforeEach(() => {
    recentState.hasMore = ref(false);
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

  it("removes exhausted recent photo media and requests another page when available", async () => {
    recentState.hasMore.value = true;
    const wrapper = mount(FlickrRecentPhotos, {
      global: {
        stubs: {
          VueDatePicker: true,
        },
      },
    });
    recentState.loadNextPage.mockClear();

    await wrapper.get("img.gallery-image").trigger("error");
    await wrapper.get("img.gallery-image").trigger("error");

    expect(recentState.removePhoto).toHaveBeenCalledWith("photo-1");
    expect(recentState.loadNextPage).toHaveBeenCalledTimes(1);
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
