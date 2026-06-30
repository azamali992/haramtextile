import * as contactRepository from "@/lib/repositories/contact-submission.repository";
import { sendContactNotification } from "@/lib/email";
import type { ContactSubmissionInput } from "@/lib/validators/contact";

/**
 * Persists the contact submission first (this is the durable record of
 * the inquiry), then attempts to send the notification email. If the
 * email fails to send (e.g. SMTP misconfigured), we still return success
 * to the visitor — the submission is safely stored and visible in the
 * admin panel — but we log the failure for operators to notice.
 */
export async function submitContactForm(input: ContactSubmissionInput) {
  const submission = await contactRepository.createContactSubmission(input);

  try {
    await sendContactNotification(input);
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "contact_notification_failed",
        submissionId: submission.id,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    );
  }

  return submission;
}

export function listSubmissions() {
  return contactRepository.findAllContactSubmissions();
}

export function getSubmissionById(id: string) {
  return contactRepository.findContactSubmissionById(id);
}

export function setSubmissionReadState(id: string, isRead: boolean) {
  return contactRepository.updateContactSubmissionReadState(id, isRead);
}
