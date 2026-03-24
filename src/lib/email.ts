import { Resend } from 'resend';

const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? 'Skolaroid <onboarding@resend.dev>';

interface SendInvitationEmailParams {
  to: string;
  inviterName: string;
  groupName: string;
  inviteLink: string;
  expiresAt: string;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

export async function sendInvitationEmail({
  to,
  inviterName,
  groupName,
  inviteLink,
  expiresAt,
}: SendInvitationEmailParams) {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `You've been invited to join "${groupName}" on Skolaroid`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>You're invited!</h2>
        <p><strong>${inviterName}</strong> has invited you to join the group <strong>${groupName}</strong> on Skolaroid.</p>
        <p>
          <a
            href="${inviteLink}"
            style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;"
          >
            Accept Invitation
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          This invitation expires on ${new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(
      `Failed to send invitation email to ${to}: ${error.message}`
    );
  }
}
