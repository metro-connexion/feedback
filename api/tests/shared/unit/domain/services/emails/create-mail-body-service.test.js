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
});
