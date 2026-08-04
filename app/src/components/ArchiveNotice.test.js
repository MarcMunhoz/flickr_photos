import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ArchiveNotice from "./ArchiveNotice.vue";

describe("ArchiveNotice", () => {
  it("explains the project archive and links to the source repository", () => {
    const wrapper = mount(ArchiveNotice);

    expect(wrapper.text()).toContain("Flickr Photos is archived");
    expect(wrapper.text()).toContain("Flickr media delivery became too unreliable");
    expect(wrapper.get("a.archive-link").attributes("href")).toBe("https://github.com/MarcMunhoz/flickr_photos");
  });
});
