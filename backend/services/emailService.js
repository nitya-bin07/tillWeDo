const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const isDev = (process.env.NODE_ENV || 'development') === 'development';
const FROM = process.env.EMAIL_FROM || 'TillWeDo <no-reply@tillwedo.app>';

// ---- Resend (HTTP API — works from Railway/cloud hosts, SMTP ports don't matter) ----
const hasResend = Boolean(process.env.RESEND_API_KEY);
let resendClient = null;
const getResend = () => {
  if (!hasResend) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

// ---- SMTP fallback (kept for local dev / non-Railway hosts; NOT used if RESEND_API_KEY is set) ----
const hasSmtp = Boolean(
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
);

let transporter = null;
const getTransporter = () => {
  if (transporter || !hasSmtp) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: String(process.env.EMAIL_SECURE) === 'true' || Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    connectionTimeout: 5000, // fail fast instead of hanging ~2 min on blocked ports
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
  return transporter;
};

const verifyTransport = async () => {
  if (hasResend) return { ok: true, provider: 'resend' };
  const tx = getTransporter();
  if (!tx) return { ok: false, reason: 'no-email-provider-configured' };
  try { await tx.verify(); return { ok: true, provider: 'smtp' }; }
  catch (err) { return { ok: false, reason: err.message }; }
};

const send = async ({ to, subject, text, html }) => {
  // 1. Prefer Resend (HTTP API — not blocked on cloud hosts like Railway)
  const resend = getResend();
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM,
        to,
        subject,
        text,
        html: html || undefined,
      });
      if (error) throw new Error(error.message || 'Resend API error');
      return { sent: true, id: data?.id };
    } catch (err) {
      console.error(`[emailService] Resend send failed to ${to}: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // 2. Fall back to SMTP (works locally; will time out fast on Railway if misconfigured)
  const tx = getTransporter();
  if (tx) {
    try {
      const info = await tx.sendMail({ from: FROM, to, subject, text, html: html || undefined });
      return { sent: true, id: info.messageId };
    } catch (err) {
      console.error(`[emailService] SMTP send failed to ${to}: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // 3. Dev fallback: print to console
  if (isDev) {
    console.log('\n📧 [emailService:dev] -------------------------------');
    console.log(`   to:      ${to}`);
    console.log(`   subject: ${subject}`);
    console.log(`   body:    ${text || html}`);
    console.log('-----------------------------------------------------\n');
    return { mocked: true };
  }

  console.warn(`[emailService] No email provider configured; email to ${to} was not sent.`);
  return { mocked: true };
};

const wrap = (title, bodyHtml) =>
  `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto">
     <h2 style="color:#e0457b">TillWeDo</h2>
     <h3>${title}</h3>
     ${bodyHtml}
     <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
     <p style="color:#999;font-size:12px">Save Together. Stay Together.</p>
   </div>`;

const sendVerificationEmail = async (user, otp) =>
  send({
    to: user.email,
    subject: 'Verify your TillWeDo account',
    text: `Hi ${user.name}, your TillWeDo verification code is ${otp}. Enter it to confirm your email and phone.`,
    html: wrap(
      'Confirm your account',
      `<p>Hi ${user.name},</p>
       <p>Your verification code is:</p>
       <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
       <p>Enter it in the app to confirm your email and phone.</p>`
    ),
  });

const sendPasswordResetEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  return send({
    to: user.email,
    subject: 'Reset your TillWeDo password',
    text: `Hi ${user.name}, reset your password with this link (valid 1 hour): ${link}\nReset token: ${token}`,
    html: wrap(
      'Reset your password',
      `<p>Hi ${user.name},</p>
       <p>Click below to set a new password (valid for 1 hour):</p>
       <p><a href="${link}" style="background:#e0457b;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Reset password</a></p>
       <p style="color:#999;font-size:12px">If you didn't request this, you can ignore this email.</p>`
    ),
  });
};

module.exports = { send, sendVerificationEmail, sendPasswordResetEmail, verifyTransport };
