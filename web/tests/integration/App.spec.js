import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { apiCheck } from "@/adapters/api-check.js";
import App from "@/App.vue";
import FooterComponent from "@/components/FooterComponent.vue";

describe("Integration | App", () => {
  it("mounts renders properly", () => {
    // when
    const wrapper = mount(App);

    // then
    expect(wrapper.text()).toContain("You did it!");
    expect(wrapper.findComponent(FooterComponent)).toBeTruthy();
  });
});
