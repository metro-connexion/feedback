import nodemailer from "nodemailer";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../../../../../../config.js";
import { logger } from "../../../../../../logger.js";
import { sendMailService } from "../../../../../../src/shared/domain/services/emails/send-mail-service.js";

vi.mock("../../../../../../logger.js");

describe("Integration | Shared | Services | Email | Send Mail", () => {
  beforeEach(() => {
    config.logging.enabled = true;
    config.email.enabled = true;
    config.email.testAccount = true;
    vi.spyOn(logger, "info");
  });

  it("should send email and log url to visualize", async () => {
    // given
    const req = {
      to: "john.doe@example.net",
      subject: "The subject",
      text: "This is the text",
    };

    // when
    const result = await sendMailService(req);

    // then
    const url = nodemailer.getTestMessageUrl(result);
    expect(logger.info).toHaveBeenCalledWith(`Email available on ${url}`);
  });

  describe("when email is disabled", () => {
    beforeEach(() => {
      config.email.enabled = false;
      vi.spyOn(logger, "info");
    });

    it("should log email disabled message with mail options", async () => {
      // given
      const req = {
        to: "john.doe@example.net",
        subject: "Test Subject",
        text: "Test content",
      };

      // when
      await sendMailService(req);

      // then
      const expectedMailOptions = {
        from: config.email.auth.user,
        to: "john.doe@example.net",
        subject: "Test Subject",
        text: "Test content",
      };
      expect(logger.info).toHaveBeenCalledWith(
        `Email disabled. Mail not sent. Mail info: ${JSON.stringify(expectedMailOptions)}`,
      );
    });
  });

  describe("with production email configuration", () => {
    beforeEach(() => {
      config.email.enabled = true;
      config.email.testAccount = false;
      config.email.service = "gmail";
      config.email.port = 587;
      config.email.secure = false;
      config.email.auth = {
        user: "prod@example.com",
        pass: "password123",
      };
    });

    it("should create transporter with production config when testAccount is false", async () => {
      // given
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({
        sendMail: vi.fn().mockResolvedValue({ messageId: "test-id" }),
      });

      const req = {
        to: "john.doe@example.net",
        subject: "Production Test",
        text: "Production content",
      };

      // when
      await sendMailService(req);

      // then
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
          user: "prod@example.com",
          pass: "password123",
        },
      });
    });

    it("should not log test URL when using production config", async () => {
      // given
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({
        sendMail: vi.fn().mockResolvedValue({ messageId: "test-id" }),
      });
      vi.spyOn(logger, "info");

      const req = {
        to: "john.doe@example.net",
        subject: "Production Test",
        text: "Production content",
      };

      // when
      await sendMailService(req);

      // then
      expect(logger.info).not.toHaveBeenCalledWith(
        expect.stringContaining("Email available on"),
      );
    });
  });

  describe("error logging", () => {
    beforeEach(() => {
      config.email.enabled = true;
      config.email.testAccount = true;
      vi.spyOn(logger, "error");
    });

    it("should log error when sendMail fails", async () => {
      // given
      const error = new Error("SMTP server not responding");
      vi.spyOn(nodemailer, "createTestAccount").mockResolvedValue({
        user: "test@ethereal.email",
        pass: "testpass",
      });
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({
        sendMail: vi.fn().mockRejectedValue(error),
      });

      const req = {
        to: "john.doe@example.net",
        subject: "Test Subject",
        text: "Test content",
      };

      // when
      try {
        await sendMailService(req);
      } catch {
        // Expected error
      }

      // then
      expect(logger.error).toHaveBeenCalledWith(`Error sending email: ${error}`);
    });
  });

  describe("createTestAccount integration", () => {
    beforeEach(() => {
      config.email.enabled = true;
      config.email.testAccount = true;
    });

    it("should handle createTestAccount failure", async () => {
      // given
      const testAccountError = new Error("Failed to create test account");
      vi.spyOn(nodemailer, "createTestAccount").mockRejectedValue(testAccountError);

      const req = {
        to: "john.doe@example.net",
        subject: "Test Subject",
        text: "Test content",
      };

      // when & then
      await expect(sendMailService(req)).rejects.toBe(testAccountError);
    });

    it("should use test account credentials when testAccount is enabled", async () => {
      // given
      const testAccount = {
        user: "test.user@ethereal.email",
        pass: "test.password",
      };
      vi.spyOn(nodemailer, "createTestAccount").mockResolvedValue(testAccount);
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({
        sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
      });

      const req = {
        to: "john.doe@example.net",
        subject: "Test Subject",
        text: "Test content",
      };

      // when
      await sendMailService(req);

      // then
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    });
  });
});
