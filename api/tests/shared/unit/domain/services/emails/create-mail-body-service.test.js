import * as fs from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import { createMailBodyService } from "../../../../../../src/shared/domain/services/emails/create-mail-body-service.js";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

describe("Unit | shared | Create mail body", () => {
  it("should replace placeholders and add footer", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Hello {{name}}, welcome!")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = { name: "John" };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("Hello John, welcome!");
    expect(result).toContain("-- Footer --");
  });

  it("should return content without placeholder", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Simple content")
      .mockResolvedValueOnce("\n-- Footer --");

    // when
    const result = await createMailBodyService("test");

    // then
    expect(result).toContain("Simple content");
    expect(result).toContain("-- Footer --");
  });

  it("should throw an error if reading failed", async () => {
    // given
    fs.readFile.mockRejectedValue(new Error("File not found"));

    // when // then
    await expect(createMailBodyService("unknown")).rejects.toThrow("File not found");
  });

  it("should escape HTML special characters to prevent XSS", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Hello {{name}}")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = { name: "<script>alert('XSS')</script>" };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;");
    expect(result).not.toContain("<script>");
  });

  it("should escape ampersands in replacement values", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Company: {{company}}")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = { company: "Smith & Sons" };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("Smith &amp; Sons");
  });

  it("should escape quotes in replacement values", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Message: {{msg}}")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = { msg: "He said \"hello\" and she said 'hi'" };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("&quot;hello&quot;");
    expect(result).toContain("&#39;hi&#39;");
  });

  it("should escape angle brackets in replacement values", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Expression: {{expr}}")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = { expr: "a < b and c > d" };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("a &lt; b and c &gt; d");
  });

  it("should handle multiple placeholders with potentially malicious content", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("User {{name}} from {{company}}")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = {
      name: "<img src=x onerror=alert('XSS')>",
      company: "<iframe src='evil.com'></iframe>",
    };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("&lt;img src=x onerror=alert(&#39;XSS&#39;)&gt;");
    expect(result).toContain("&lt;iframe src=&#39;evil.com&#39;&gt;&lt;/iframe&gt;");
    expect(result).not.toContain("<img");
    expect(result).not.toContain("<iframe");
  });

  it("should handle null and undefined replacement values", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Value1: {{val1}}, Value2: {{val2}}")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = {
      val1: null,
      val2: undefined,
    };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("Value1: , Value2: ");
  });

  it("should convert non-string replacement values to strings", async () => {
    // given
    fs.readFile
      .mockResolvedValueOnce("Number: {{num}}, Boolean: {{bool}}")
      .mockResolvedValueOnce("\n-- Footer --");

    const replaceElements = {
      num: 123,
      bool: true,
    };

    // when
    const result = await createMailBodyService("test", replaceElements);

    // then
    expect(result).toContain("Number: 123");
    expect(result).toContain("Boolean: true");
  });
});
