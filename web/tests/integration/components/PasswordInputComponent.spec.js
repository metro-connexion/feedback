import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import PasswordInputComponent from "@/components/PasswordInputComponent.vue";

describe("Integration | Components | Password input component", () => {
  it("should render a password input by default", () => {
    // given / when
    const wrapper = mount(PasswordInputComponent, {
      props: { modelValue: "" },
    });

    // then
    const input = wrapper.find("input");
    expect(input.attributes("type")).toBe("password");
  });

  it("should toggle to text type when the show button is clicked", async () => {
    // given
    const wrapper = mount(PasswordInputComponent, {
      props: { modelValue: "" },
    });

    // when
    await wrapper.find("button").trigger("click");

    // then
    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  it("should toggle back to password type on second click", async () => {
    // given
    const wrapper = mount(PasswordInputComponent, {
      props: { modelValue: "" },
    });

    // when
    await wrapper.find("button").trigger("click");
    await wrapper.find("button").trigger("click");

    // then
    expect(wrapper.find("input").attributes("type")).toBe("password");
  });

  it("should emit update:modelValue on input", async () => {
    // given
    const wrapper = mount(PasswordInputComponent, {
      props: { modelValue: "" },
    });

    // when
    await wrapper.find("input").setValue("mypassword");

    // then
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["mypassword"]);
  });

  it("should display the placeholder when provided", () => {
    // given / when
    const wrapper = mount(PasswordInputComponent, {
      props: { modelValue: "", placeholder: "Enter password" },
    });

    // then
    expect(wrapper.find("input").attributes("placeholder")).toBe("Enter password");
  });
});
