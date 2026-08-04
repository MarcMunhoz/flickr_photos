import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import FlickrPhotoImage from "./FlickrPhotoImage.vue";

describe("FlickrPhotoImage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a placeholder until the active image candidate loads", async () => {
    const wrapper = mount(FlickrPhotoImage, {
      props: {
        alt: "Dance Of The Butterflies",
        candidates: ["bad.jpg", "good.jpg"],
      },
    });

    expect(wrapper.get(".photo-placeholder").text()).toContain("Dance Of The Butterflies");
    expect(wrapper.get("img").classes()).toContain("is-hidden");

    await wrapper.get("img").trigger("load");

    expect(wrapper.find(".photo-placeholder").exists()).toBe(false);
    expect(wrapper.get("img").classes()).not.toContain("is-hidden");
  });

  it("keeps the placeholder visible while failed candidates are exhausted", async () => {
    const wrapper = mount(FlickrPhotoImage, {
      props: {
        alt: "Golden Flower",
        candidates: ["bad.jpg", "also-bad.jpg"],
      },
    });

    await wrapper.get("img").trigger("error");

    expect(wrapper.get("img").attributes("src")).toBe("also-bad.jpg");
    expect(wrapper.get(".photo-placeholder").text()).toContain("Golden Flower");

    await wrapper.get("img").trigger("error");

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.get(".photo-placeholder").text()).toContain("Image unavailable");
  });

  it("advances to the next image candidate when the active candidate times out", async () => {
    vi.useFakeTimers();

    const wrapper = mount(FlickrPhotoImage, {
      props: {
        alt: "Golden Flower",
        candidates: ["slow.jpg", "fallback.jpg"],
        candidateTimeoutMs: 50,
      },
    });

    expect(wrapper.get("img").attributes("src")).toBe("slow.jpg");

    await vi.advanceTimersByTimeAsync(50);

    expect(wrapper.get("img").attributes("src")).toBe("fallback.jpg");
    expect(wrapper.get(".photo-placeholder").text()).toContain("Golden Flower");
  });

  it("stops retrying when every image candidate times out", async () => {
    vi.useFakeTimers();

    const wrapper = mount(FlickrPhotoImage, {
      props: {
        alt: "Golden Flower",
        candidates: ["slow.jpg"],
        candidateTimeoutMs: 50,
      },
    });

    await vi.advanceTimersByTimeAsync(50);

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.get(".photo-placeholder").text()).toContain("Image unavailable");
  });

  it("emits unavailable when every image candidate fails", async () => {
    const wrapper = mount(FlickrPhotoImage, {
      props: {
        alt: "Golden Flower",
        candidates: ["bad.jpg"],
      },
    });

    await wrapper.get("img").trigger("error");

    expect(wrapper.emitted("unavailable")).toEqual([[]]);
  });
});
