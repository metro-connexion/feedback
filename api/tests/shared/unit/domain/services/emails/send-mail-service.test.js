import nodemailer from "nodemailer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../../../../../../config.js";
import { logger } from "../../../../../../logger.js";
import { sendMailService } from "../../../../../../src/shared/domain/services/emails/send-mail-service.js";

const { email } = config;

vi.mock("nodemailer");
vi.mock("../../../../../../logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Unit | Shared | Domain | Services | Emails Send mail", () => {
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

  describe("Logging security when email is disabled", () => {
    beforeEach(() => {
      email.enabled = false;
      vi.clearAllMocks();
    });

    describe("in production environment", () => {
      beforeEach(() => {
        config.environment = "production";
      });

      it("should redact recipient email address in logs", async () => {
        // given
        const req = {
          to: "sensitive-user@example.net",
          subject: "Test subject",
          text: "Test content",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).not.toContain("sensitive-user@example.net");
        expect(logCall).toContain("[REDACTED]");
      });

      it("should redact email subject in logs", async () => {
        // given
        const req = {
          to: "user@example.net",
          subject: "Confidential: password reset",
          text: "Test content",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).not.toContain("Confidential: password reset");
        expect(logCall).toContain("[REDACTED]");
      });

      it("should redact text content in logs", async () => {
        // given
        const req = {
          to: "user@example.net",
          subject: "Test",
          text: "Your password is: secret123",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).not.toContain("Your password is: secret123");
        expect(logCall).toContain("[REDACTED - 27 characters]");
      });

      it("should redact HTML content in logs", async () => {
        // given
        const req = {
          to: "user@example.net",
          subject: "Test",
          html: "<html><body>Sensitive data here</body></html>",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).not.toContain("Sensitive data here");
        expect(logCall).toContain("[REDACTED - 45 characters]");
      });

      it("should include from address in logs as it is not sensitive", async () => {
        // given
        const req = {
          to: "user@example.net",
          subject: "Test",
          text: "Test content",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).toContain("john.doe@example.net");
      });
    });

    describe("in development environment", () => {
      beforeEach(() => {
        config.environment = "development";
      });

      it("should log full recipient email address for debugging", async () => {
        // given
        const req = {
          to: "developer@example.net",
          subject: "Test subject",
          text: "Test content",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).toContain("developer@example.net");
        expect(logCall).not.toContain("[REDACTED]");
      });

      it("should log full email subject for debugging", async () => {
        // given
        const req = {
          to: "dev@example.net",
          subject: "Debug: test email",
          text: "Test content",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).toContain("Debug: test email");
      });

      it("should log full text content for debugging", async () => {
        // given
        const req = {
          to: "dev@example.net",
          subject: "Test",
          text: "Debug content here",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).toContain("Debug content here");
      });

      it("should log full HTML content for debugging", async () => {
        // given
        const req = {
          to: "dev@example.net",
          subject: "Test",
          html: "<html><body>Debug HTML content</body></html>",
        };

        // when
        await sendMailService(req);

        // then
        expect(logger.info).toHaveBeenCalledOnce();
        const logCall = logger.info.mock.calls[0][0];
        expect(logCall).toContain("Debug HTML content");
      });
    });
  });
});
