/**
 * Nodemailer-based notification sender for the public contact form.
 *
 * All SMTP configuration comes from the validated `config` object in
 * `lib/config.ts` - never read `process.env` directly here.
 */
import nodemailer from "nodemailer";
import { config } from "@/lib/config";

export interface ContactNotificationInput {
  name: string;
  email: string;
  company?: string | null;
  message: string;
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: Number(config.EMAIL_PORT),
      secure: Number(config.EMAIL_PORT) === 465,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
  }
  return cachedTransporter;
}

/** Minimal HTML-escaping so untrusted form input can't break out of the email's HTML body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sends a notification email to the configured sales inbox whenever a new
 * contact form submission is received. Input is treated as untrusted and
 * HTML-escaped before being embedded in the email body.
 */
export async function sendContactNotification(
  submission: ContactNotificationInput,
): Promise<void> {
  const transporter = getTransporter();

  const safeName = escapeHtml(submission.name);
  const safeEmail = escapeHtml(submission.email);
  const safeCompany = submission.company ? escapeHtml(submission.company) : "-";
  const safeMessage = escapeHtml(submission.message).replace(/\n/g, "<br />");

  await transporter.sendMail({
    from: config.EMAIL_USER,
    to: config.EMAIL_TO,
    replyTo: submission.email,
    subject: `New contact form submission from ${submission.name}`,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Company: ${submission.company ?? "-"}`,
      "",
      submission.message,
    ].join("\n"),
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Company:</strong> ${safeCompany}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `,
  });
}
