import nodemailer from "nodemailer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../../../../../../config.js";
import { sendMailService } from "../../../../../../src/shared/domain/services/emails/send-mail-service.js";

const { email } = config;

vi.mock("nodemailer");
describe("Unit | Shared | Services | Send mail", () => {
  beforeEach(() => {
    email.auth.user = "john.doe@example.net";
    nodemailer.createTransport.mockReturnValue({
      sendMail: vi.fn().mockResolvedValue(true),
    });
  });

  describe("destination", () => {
    it("should throw an error if not destination", async () => {
      // given
      const req = {
        subject: "The subject",
        html: "This is the text",
      };

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toThrow("Recipient email address is required");
    });

    it("should throw an error if destination is empty string", async () => {
      // given
      const req = {
        to: "",
        subject: "The subject",
        html: "This is the text",
      };

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toThrow("Recipient email address is required");
    });

    it("should throw an error if destination is null", async () => {
      // given
      const req = {
        to: null,
        subject: "The subject",
        html: "This is the text",
      };

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toThrow("Recipient email address is required");
    });

    it("should throw an error if req is empty object", async () => {
      // given
      const req = {};

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toThrow("Recipient email address is required");
    });
  });

  describe("Subject handling", () => {
    beforeEach(() => {
      email.enabled = false;
    });

    it("should use default subject when subject is undefined", async () => {
      // given
      const req = {
        to: "alex-terieur@example.net",
        text: "This is the text",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(result.data.subject).toEqual("No Subject");
    });

    it("should use default subject when subject is null", async () => {
      // given
      const req = {
        to: "alex-terieur@example.net",
        subject: null,
        text: "This is the text",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(result.data.subject).toEqual("No Subject");
    });

    it("should use default subject when subject is empty string", async () => {
      // given
      const req = {
        to: "alex-terieur@example.net",
        subject: "",
        text: "This is the text",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(result.data.subject).toEqual("No Subject");
    });
  });

  describe("Content handling", () => {
    beforeEach(() => {
      email.enabled = false;
    });

    it("should prioritize html over text when both are provided", async () => {
      // given
      const req = {
        to: "alex-terieur@example.net",
        subject: "Test subject",
        text: "Text content",
        html: "HTML content",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(result.data).toEqual({
        from: "john.doe@example.net",
        to: "alex-terieur@example.net",
        subject: "Test subject",
        html: "HTML content",
      });
      expect(result.data.text).toBeUndefined();
    });

    it("should throw an error if no text and no html are provided", async () => {
      // given
      const req = {
        to: "alex-terieur@example.net",
        subject: "Test subject",
      };

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toThrow("Email content is required");
    });
  });

  describe("when mail is disabled", () => {
    it("should return the email object with text", async () => {
      // given
      email.enabled = false;
      const req = {
        to: "alex-terieur@example.net",
        subject: "The subject",
        text: "This is the text",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(result).toEqual({
        info: "Email sending disabled",
        data: {
          from: "john.doe@example.net",
          to: "alex-terieur@example.net",
          subject: "The subject",
          text: "This is the text",
        },
      });
    });

    it("should return the email object with html", async () => {
      // given
      email.enabled = false;
      const req = {
        to: "alex-terieur@example.net",
        subject: "The subject",
        html: "This is the text",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(result).toEqual({
        info: "Email sending disabled",
        data: {
          from: "john.doe@example.net",
          to: "alex-terieur@example.net",
          subject: "The subject",
          html: "This is the text",
        },
      });
    });
  });

  describe("when mail is enabled", () => {
    beforeEach(() => {
      email.enabled = true;
    });
    it("should send email correctly with text", async () => {
      // given
      const req = {
        to: "alex-terieur@example.net",
        subject: "The subject",
        text: "This is the text",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "john.doe@example.net",
        to: "alex-terieur@example.net",
        subject: "The subject",
        text: "This is the text",
      });
      expect(result).toBe(true);
    });

    it("should send email correctly with html", async () => {
      // given
      const req = {
        to: "alex-terieur@example.net",
        subject: "The subject",
        html: "This is the text",
      };

      // when
      const result = await sendMailService(req);

      // then
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
        from: "john.doe@example.net",
        to: "alex-terieur@example.net",
        subject: "The subject",
        html: "This is the text",
      });
      expect(result).toBe(true);
    });

    it("should return error", async () => {
      // given
      nodemailer.createTransport().sendMail.mockRejectedValue("Network error");
      const req = {
        to: "alex-terieur@example.net",
        subject: "The subject",
        html: "This is the text",
      };

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toBe("Network error");
    });

    it("should handle different types of sendMail errors", async () => {
      // given
      const errorMessage = new Error("SMTP connection failed");
      nodemailer.createTransport().sendMail.mockRejectedValue(errorMessage);
      const req = {
        to: "alex-terieur@example.net",
        subject: "The subject",
        html: "This is the text",
      };

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toBe(errorMessage);
    });

    it("should handle authentication errors", async () => {
      // given
      const authError = new Error("Invalid authentication credentials");
      nodemailer.createTransport().sendMail.mockRejectedValue(authError);
      const req = {
        to: "alex-terieur@example.net",
        subject: "The subject",
        text: "This is the text",
      };

      // when
      const promise = sendMailService(req);

      // then
      await expect(promise).rejects.toBe(authError);
    });
  });
});
