import nodemailer from "nodemailer";

import {
  GMAIL_SMTP_APP_PASSWORD,
  GMAIL_SMTP_FROM_NAME,
  GMAIL_SMTP_USER,
} from "../config.js";

let transporter = null;

function getTransporter() {
  if (!GMAIL_SMTP_USER || !GMAIL_SMTP_APP_PASSWORD) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_SMTP_USER, pass: GMAIL_SMTP_APP_PASSWORD },
    });
  }
  return transporter;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * The one-time email a newly created employee account gets: their sign-in
 * email and the temporary password an administrator generated for them
 * (see `createUser`) — the only place that password is ever visible in
 * plaintext, same as the admin UI that shows it once after creation. Sent
 * from the company's Gmail/Google Workspace mailbox over SMTP. Never
 * throws — account creation has already succeeded by the time this runs,
 * so a delivery failure is logged, not surfaced to the caller.
 */
export async function sendWelcomeEmail({ userId, name, email, temporaryPassword }) {
  const client = getTransporter();
  if (!client) {
    console.error("Welcome email delivery is not configured", { userId });
    return false;
  }
  try {
    await client.sendMail({
      from: `"${GMAIL_SMTP_FROM_NAME}" <${GMAIL_SMTP_USER}>`,
      to: email,
      subject: "Your SITA Shelters account",
      text: [
        `Hi ${name},`,
        "",
        "An account has been created for you on SITA Shelters.",
        "",
        `Sign-in email: ${email}`,
        `Temporary password: ${temporaryPassword}`,
        "",
        "Please sign in and change your password as soon as possible.",
      ].join("\n"),
      html: [
        `<p>Hi ${escapeHtml(name)},</p>`,
        "<p>An account has been created for you on SITA Shelters.</p>",
        `<p><strong>Sign-in email:</strong> ${escapeHtml(email)}<br />`,
        `<strong>Temporary password:</strong> ${escapeHtml(temporaryPassword)}</p>`,
        "<p>Please sign in and change your password as soon as possible.</p>",
      ].join("\n"),
    });
    return true;
  } catch (error) {
    console.error("Welcome email delivery failed", { userId, error });
    return false;
  }
}
