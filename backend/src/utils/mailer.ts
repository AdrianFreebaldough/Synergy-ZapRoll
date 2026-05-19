import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface SMTPAccount {
  email: string;
  transporter: nodemailer.Transporter;
  isBlocked: boolean;
  blockedAt: number | null;
}

// 1. Initialize SMTP pool with primary and backup accounts
const accountsConfig = [
  {
    email: process.env.SMTP_USER || 'qcusynergy2026@gmail.com',
    pass: process.env.SMTP_PASS || 'urov dlgy ccbo piee'
  },
  {
    email: process.env.SMTP_USER_BACKUP_1 || 'qcusynergy2026.2@gmail.com',
    pass: process.env.SMTP_PASS_BACKUP_1 || 'fkaq ugkm svse rtxf'
  }
  // To add more backup accounts in the future, simply append them below!
];

const smtpPool: SMTPAccount[] = accountsConfig
  .filter(cfg => cfg.email && cfg.pass)
  .map(cfg => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, 
      auth: {
        user: cfg.email,
        pass: cfg.pass,
      },
    });

    // Verify connections on startup
    transporter.verify((error) => {
      if (error) {
        console.error(`❌ Mailer Connection Error for ${cfg.email}:`, error.message);
      } else {
        console.log(`✅ Mailer is ready to send emails using ${cfg.email}`);
      }
    });

    return {
      email: cfg.email,
      transporter,
      isBlocked: false,
      blockedAt: null
    };
  });

/**
 * Detects if Nodemailer error is related to quota, sending limits, or suspensions
 */
const isQuotaLimitError = (error: any): boolean => {
  const errMsg = String(error?.message || error || '').toLowerCase();
  const errCode = String(error?.code || '');

  return (
    errMsg.includes('limit') ||
    errMsg.includes('quota') ||
    errMsg.includes('blocked') ||
    errMsg.includes('exceeded') ||
    errMsg.includes('suspension') ||
    errMsg.includes('rejected') ||
    errCode === '454' ||
    errCode === '421' ||
    errCode === '550'
  );
};

/**
 * Sends an email with automatic SMTP rotation, instant skip for blocked accounts,
 * unified replyTo forwarding, and 24-hour auto-reset cooldown.
 */
const sendMailWithRotation = async (options: {
  to: string;
  subject: string;
  html: string;
}): Promise<any> => {
  if (smtpPool.length === 0) {
    throw new Error('No SMTP accounts are configured in the system.');
  }

  const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 Hours
  const now = Date.now();

  // Reset any accounts whose block duration has expired
  smtpPool.forEach(acc => {
    if (acc.isBlocked && acc.blockedAt && (now - acc.blockedAt > COOLDOWN_MS)) {
      console.log(`🔄 [Mailer] 24-hour block expired for ${acc.email}. Unblocking account.`);
      acc.isBlocked = false;
      acc.blockedAt = null;
    }
  });

  let lastError: any = null;

  // Try active accounts sequentially
  for (const acc of smtpPool) {
    if (acc.isBlocked) {
      console.log(`⏩ [Mailer] Skipping blocked account: ${acc.email}`);
      continue;
    }

    try {
      const mailOptions = {
        from: `"Synergy Event Team" <${acc.email}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: smtpPool[0].email // Direct replies strictly to your primary inbox
      };

      const info = await acc.transporter.sendMail(mailOptions);
      console.log(`✉️ [Mailer] Email sent successfully using ${acc.email} to: ${options.to}`);
      return info;
    } catch (error: any) {
      console.error(`⚠️ [Mailer] Failed to send email using ${acc.email}:`, error.message || error);

      if (isQuotaLimitError(error)) {
        console.warn(`⛔ [Mailer] Account ${acc.email} has hit its daily sending quota/limit. Marking as BLOCKED.`);
        acc.isBlocked = true;
        acc.blockedAt = Date.now();
      }

      lastError = error;
      // Loop automatically rolls over to try the next available unblocked transporter!
    }
  }

  throw new Error(`All configured SMTP accounts failed to send the email. Last error: ${lastError?.message || lastError}`);
};

/**
 * Sends a registration success email
 */
export const sendRegistrationEmail = async (email: string, name: string, role?: string | string[]) => {
  const roles = Array.isArray(role) ? role : (role ? [role] : []);
  const isPoster = roles.includes('Poster Presenter') || roles.includes('Poster Attendee');

  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Registration Successful!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>You are officially registered for the <strong>Synergy Event</strong>. We are excited to have you!</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; margin-bottom: 5px; color: #1e293b;">Event Schedule:</h3>
          <p style="margin: 0 0 10px 0; color: #475569; font-weight: bold;">📅 May 20, 2026</p>
          ${isPoster ? `
            <ul style="list-style: none; padding-left: 0; margin: 0; color: #475569;">
              <li>🎨 <strong>Poster Session & Exhibition:</strong> 11:00 AM – 5:00 PM</li>
            </ul>
          ` : `
            <ul style="list-style: none; padding-left: 0; margin: 0; color: #475569;">
              <li>☀️ <strong>AM Session:</strong> 9:00 AM – 12:00 PM</li>
              <li>🌙 <strong>PM Session:</strong> 1:00 PM – 5:00 PM</li>
            </ul>
          `}
        </div>

        <div style="border-left: 4px solid #f59e0b; padding-left: 15px; margin: 20px 0;">
          <p style="font-weight: bold; color: #b45309;">⚠️ Important Reminders:</p>
          <ul style="padding-left: 20px;">
            ${!isPoster ? `
              <li><strong>Check-in Window:</strong> Attendance begins at <strong>8:00 AM</strong> and closes promptly at <strong>8:30 AM</strong>.</li>
              <li><strong>Slot Policy:</strong> Please arrive early. Any pre-registered slots not claimed by <strong>8:30 AM</strong> will be released and allocated to walk-in participants.</li>
            ` : ''}
            ${roles.includes('Poster Attendee') ? `
              <li><strong>Mandatory Attendance:</strong> You only need to log your attendance once during the exhibition session for certificate eligibility.</li>
            ` : roles.includes('Poster Presenter') ? `
              <li><strong>Mandatory Attendance:</strong> You need to record both your check-in and logout for the Poster Session to be eligible for a certificate.</li>
            ` : `
              <li><strong>Mandatory Attendance:</strong> You need to log your attendance for both the AM and PM sessions for certificate eligibility.</li>
            `}
          </ul>
        </div>

        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

  try {
    await sendMailWithRotation({
      to: email,
      subject: 'Synergy Event - Registration Confirmed!',
      html
    });
  } catch (error) {
    console.error('Error sending registration email after rotation fallback:', error);
  }
};

/**
 * Sends an attendance confirmation email with a unique verification ID
 */
export const sendAttendanceEmail = async (email: string, name: string, sessionType: string, verificationId: string) => {
  const sessionLabel = sessionType.toUpperCase().includes('PM') ? 'Afternoon (PM)' : 'Morning (AM)';
  
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Attendance Verified!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your attendance for the <strong>${sessionLabel}</strong> session has been successfully logged.</p>
        
        <div style="text-align: center; background-color: #ecfdf5; border: 2px dashed #10b981; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <p style="margin: 0; color: #064e3b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Unique Verification Code</p>
          <h1 style="margin: 10px 0; color: #065f46; font-size: 32px; letter-spacing: 2px;">${verificationId}</h1>
          <p style="margin: 0; color: #064e3b; font-size: 12px;">Present this code if manual verification is requested.</p>
        </div>

        <p>Enjoy the rest of the event!</p>

        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px;">
          Verified on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
      </div>
    `;

  try {
    await sendMailWithRotation({
      to: email,
      subject: `Attendance Verified - ${sessionLabel}`,
      html
    });
  } catch (error) {
    console.error('Error sending attendance email after rotation fallback:', error);
  }
};
