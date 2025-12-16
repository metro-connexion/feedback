import { mount } from "@vue/test-utils";

import pkg from "@/../package.json";
import FooterComponent from "@/components/FooterComponent.vue";

describe("Integration | Components | Footer component", () => {
  it("should display correctly the footer component", () => {
    // given
    const yearDate = new Date().getFullYear();
    const { author, version } = pkg;

    // when
    const wrapper = mount(FooterComponent);

    // then
    expect(wrapper.text()).toContain(yearDate);
    expect(wrapper.text()).toContain(author);
    expect(wrapper.text()).toContain(version);
  });
});
