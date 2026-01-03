import * as fs from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import { createMailBodyService } from "../../../../../../src/shared/domain/services/emails/create-mail-body-service.js";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

describe("Unit | Shared | Domain | Services | Email | Create mail body", () => {
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

  describe("escapeRegExp functionality", () => {
    it("should correctly replace placeholder with dot (.) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Value: {{file.name}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "file.name": "document.pdf" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Value: document.pdf");
    });

    it("should correctly replace placeholder with asterisk (*) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Pattern: {{glob*pattern}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "glob*pattern": "*.js" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Pattern: *.js");
    });

    it("should correctly replace placeholder with plus (+) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Expression: {{regex+pattern}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "regex+pattern": "a+" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Expression: a+");
    });

    it("should correctly replace placeholder with question mark (?) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Query: {{is?valid}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "is?valid": "maybe?" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Query: maybe?");
    });

    it("should correctly replace placeholder with caret (^) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Start: {{^beginning}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "^beginning": "^start" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Start: ^start");
    });

    it("should correctly replace placeholder with dollar ($) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Price: {{amount$}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "amount$": "$100" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Price: $100");
    });

    it("should correctly replace placeholder with parentheses () characters", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Group: {{(capture)}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "(capture)": "(group)" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Group: (group)");
    });

    it("should correctly replace placeholder with pipe (|) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Or: {{option|choice}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "option|choice": "a|b" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Or: a|b");
    });

    it("should correctly replace placeholder with square brackets ([]) characters", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Array: {{items[0]}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "items[0]": "[first]" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Array: [first]");
    });

    it("should correctly replace placeholder with backslash (\\) character", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Path: {{path\\to\\file}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { "path\\to\\file": "C:\\Users\\test" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Path: C:\\Users\\test");
    });

    it("should correctly replace multiple placeholders with special characters", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("File: {{file.name}} at {{path\\location}} costs {{price$}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = {
        "file.name": "doc.pdf",
        "path\\location": "C:\\docs",
        "price$": "$50",
      };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("File: doc.pdf at C:\\docs costs $50");
    });

    it("should correctly replace placeholder containing all special regex characters", async () => {
      // given
      fs.readFile
        .mockResolvedValueOnce("Complex: {{.*+?^${}()|[]\\}}")
        .mockResolvedValueOnce("\n-- Footer --");

      const replaceElements = { ".*+?^${}()|[]\\": "all-special-chars" };

      // when
      const result = await createMailBodyService("test", replaceElements);

      // then
      expect(result).toContain("Complex: all-special-chars");
    });
  });
});
