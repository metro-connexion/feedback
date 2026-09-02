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
    config.email.host = "localhost";
    config.email.port = 1025;
    config.email.secure = false;
    config.email.auth = { user: undefined, pass: undefined };
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
        from: "no-reply@example.com",
        to: "john.doe@example.net",
        subject: "Test Subject",
        text: "Test content",
      };
      expect(logger.info).toHaveBeenCalledWith({ mailOptions: expectedMailOptions },
        "Email disabled. Mail not sent. Mail info",
      );
    });
  });

  describe("with Mailpit-style configuration (no auth)", () => {
    beforeEach(() => {
      config.email.enabled = true;
      config.email.host = "localhost";
      config.email.port = 1025;
      config.email.secure = false;
      config.email.auth = { user: undefined, pass: undefined };
    });

    it("should create a transporter without auth", async () => {
      // given
      const sendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({ sendMail });

      const req = {
        to: "john.doe@example.net",
        subject: "Mailpit Test",
        text: "Mailpit content",
      };

      // when
      await sendMailService(req);

      // then
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "localhost",
        port: 1025,
        secure: false,
      });
    });

    it("should use a default from address when no auth user is configured", async () => {
      // given
      const sendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({ sendMail });

      const req = {
        to: "john.doe@example.net",
        subject: "Mailpit Test",
        text: "Mailpit content",
      };

      // when
      await sendMailService(req);

      // then
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: "no-reply@example.com" }),
      );
    });
  });

  describe("with production email configuration", () => {
    beforeEach(() => {
      config.email.enabled = true;
      config.email.host = "smtp.gmail.com";
      config.email.port = 587;
      config.email.secure = false;
      config.email.auth = {
        user: "prod@example.com",
        pass: "password123",
      };
    });

    it("should create transporter with auth when credentials are provided", async () => {
      // given
      const sendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({ sendMail });

      const req = {
        to: "john.doe@example.net",
        subject: "Production Test",
        text: "Production content",
      };

      // when
      await sendMailService(req);

      // then
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "prod@example.com",
          pass: "password123",
        },
      });
    });

    it("should use auth user as the from address", async () => {
      // given
      const sendMail = vi.fn().mockResolvedValue({ messageId: "test-id" });
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({ sendMail });

      const req = {
        to: "john.doe@example.net",
        subject: "Production Test",
        text: "Production content",
      };

      // when
      await sendMailService(req);

      // then
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: "prod@example.com" }),
      );
    });
  });

  describe("error logging", () => {
    beforeEach(() => {
      config.email.enabled = true;
      config.email.host = "localhost";
      config.email.port = 1025;
      config.email.secure = false;
      config.email.auth = { user: undefined, pass: undefined };
      vi.spyOn(logger, "error");
    });

    it("should log error when sendMail fails", async () => {
      // given
      const error = new Error("SMTP server not responding");
      vi.spyOn(nodemailer, "createTransport").mockReturnValue({
        sendMail: vi.fn().mockRejectedValue(error),
      });

      const req = {
        to: "john.doe@example.net",
        subject: "Test Subject",
        text: "Test content",
      };

      // when
      await expect(sendMailService(req)).rejects.toBe(error);

      // then
      expect(logger.error).toHaveBeenCalledWith({ err: error }, "Error sending email");
    });
  });
});
