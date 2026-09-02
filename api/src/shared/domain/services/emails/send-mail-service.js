import nodemailer from "nodemailer";

import { config } from "../../../../../config.js";
import { logger } from "../../../../../logger.js";

const { email } = config;

/**
 * Send an email using nodemailer
 * @param {object} req - Email request object
 * @param {string} req.to - Recipient email address
 * @param {string} [req.subject] - Email subject
 * @param {string} [req.text] - Plain text email content
 * @param {string} [req.html] - HTML email content
 * @returns {Promise<object>} The email send result
 */
async function sendMailService(req) {
  if (!req.to) {
    throw new Error("Recipient email address is required");
  }

  const mailOptions = {
    from: email.auth?.user || "no-reply@example.com",
    to: req.to,
    subject: req.subject || "No Subject",
  };

  if (req.text && !req.html) {
    mailOptions.text = req.text;
  } else if (req.html) {
    mailOptions.html = req.html;
  } else {
    throw new Error("Email content is required");
  }

  if (!email.enabled) {
    logger.info({ mailOptions }, "Email disabled. Mail not sent. Mail info");
    return {
      info: "Email sending disabled",
      data: mailOptions,
    };
  }

  const transporter = nodemailer.createTransport({
    host: email.host,
    port: email.port,
    secure: email.secure,
    ...(email.auth?.user && email.auth?.pass ? { auth: email.auth } : {}),
  });
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    logger.error({ err: error }, "Error sending email");
    throw error;
  }
}

export { sendMailService };
