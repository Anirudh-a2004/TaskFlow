export async function sendEmail({ to, subject, text }) {
  console.log(`[email notification] ${subject} -> ${to}: ${text}`);
  return { accepted: [to] };
}
