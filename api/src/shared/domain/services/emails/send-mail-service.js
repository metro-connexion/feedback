import nodemailer from "nodemailer";

import { config } from "../../../../../config.js";
import { logger } from "../../../../../logger.js";

const { email } = config;

/**
 * Sanitize mail options for logging to prevent information disclosure
 * @param {object} mailOptions - The mail options object
 * @returns {object} Sanitized mail options safe for logging
 */
function sanitizeMailOptionsForLogging(mailOptions) {
  const sanitized = {
    from: mailOptions.from,
    to: mailOptions.to ? "[REDACTED]" : undefined,
    subject: mailOptions.subject ? "[REDACTED]" : undefined,
  };

  if (mailOptions.text) {
    sanitized.text = `[REDACTED - ${mailOptions.text.length} characters]`;
  }
  if (mailOptions.html) {
    sanitized.html = `[REDACTED - ${mailOptions.html.length} characters]`;
  }

  return sanitized;
}

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
    from: email.auth.user,
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
    const logOptions = config.environment === "production" 
      ? sanitizeMailOptionsForLogging(mailOptions)
      : mailOptions;
    logger.info(`Email disabled. Mail not sent. Mail info: ${JSON.stringify(logOptions)}`);
    return {
      info: "Email sending disabled",
      data: mailOptions,
    };
  }
  let transporter, testAccount;

  if (email.testAccount) {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: email.service,
      port: email.port,
      secure: email.secure,
      auth: email.auth,
    });
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    if (email.testAccount) {
      logger.info(`Email available on ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
    throw error;
  }
}

export { sendMailService };
