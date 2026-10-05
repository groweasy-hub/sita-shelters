import { EMAIL_FROM, PUBLIC_APP_URL, RESEND_API_KEY } from "../config.js";

function passwordResetUrl(token) {
  const url = new URL("/reset-password", PUBLIC_APP_URL);
  url.searchParams.set("token", token);
  return url.toString();
}

async function sendEmail({ to, subject, text, userId }) {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.error("Authentication email delivery is not configured", {
      userId,
    });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, text }),
    });
    if (!response.ok) {
      console.error("Authentication email delivery failed", {
        userId,
        status: response.status,
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Authentication email delivery failed", {
      userId,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return false;
  }
}

export function sendPasswordResetEmail({
  userId,
  email,
  token,
  locked = false,
}) {
  // PUBLIC_APP_URL (and its FRONTEND_ORIGINS fallback) now come from .env
  // only, with no hardcoded default — fail the same safe way `sendEmail`
  // does below instead of throwing on an unconfigured deployment.
  if (!PUBLIC_APP_URL) {
    console.error("Password reset email delivery is not configured", {
      userId,
    });
    return Promise.resolve(false);
  }
  const resetUrl = passwordResetUrl(token);
  const subject = locked
    ? "Your SITA Shelters account needs attention"
    : "Reset your SITA Shelters password";
  const text = locked
    ? `We noticed unsuccessful sign-in attempts. Reset your password: ${resetUrl}`
    : `Reset your password: ${resetUrl}`;
  // Deliberately do not await delivery on the request path or log the link.
  return sendEmail({ to: email, subject, text, userId });
}
