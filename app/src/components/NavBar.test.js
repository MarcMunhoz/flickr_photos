import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import NavBar from "./NavBar.vue";

function mountWithRoute(path = "/") {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: { template: "<div />" },
        meta: { headerTitle: "Flickr Photos Archive" },
      },
      {
        path: "/:pathMatch(.*)*",
        redirect: "/",
      },
    ],
  });

  router.push(path);

  return router.isReady().then(() =>
    mount(NavBar, {
      global: {
        plugins: [router],
      },
    })
  );
}

describe("NavBar", () => {
  it("does not expose gallery navigation or search controls in archived mode", async () => {
    const wrapper = await mountWithRoute("/");

    expect(wrapper.text()).toContain("Flickr Photos Archive");
    expect(wrapper.text()).not.toContain("Recent Photos");
    expect(wrapper.find("form").exists()).toBe(false);
    expect(wrapper.find("input").exists()).toBe(false);
  });
});
