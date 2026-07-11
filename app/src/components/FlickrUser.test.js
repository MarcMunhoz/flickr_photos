import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import FlickrUser from "./FlickrUser.vue";

const { searchUserGalleryMock } = vi.hoisted(() => ({
  searchUserGalleryMock: vi.fn(),
}));

vi.mock("@/composables/useUserGallery.js", () => ({
  useUserGallery: () => ({
    error: ref(""),
    isLoading: ref(false),
    searchUserGallery: searchUserGalleryMock,
  }),
}));

describe("FlickrUser", () => {
  it("submits the typed username and clears the input after success", async () => {
    searchUserGalleryMock.mockResolvedValue(true);
    const wrapper = mount(FlickrUser);

    await wrapper.get("input").setValue("alice");
    await wrapper.get("form").trigger("submit");

    expect(searchUserGalleryMock).toHaveBeenCalledWith("alice");
    expect(wrapper.get("input").element.value).toBe("");
  });

  it("keeps the username when the search fails", async () => {
    searchUserGalleryMock.mockResolvedValue(false);
    const wrapper = mount(FlickrUser);

    await wrapper.get("input").setValue("missing-user");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.get("input").element.value).toBe("missing-user");
  });
});
