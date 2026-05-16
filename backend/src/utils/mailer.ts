import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mailer Connection Error:', error);
  } else {
    console.log('✅ Mailer is ready to send emails');
  }
});

/**
 * Sends a registration success email
 */
export const sendRegistrationEmail = async (email: string, name: string, role?: string) => {
  const isPoster = role === 'Poster Presenter';

  const mailOptions = {
    from: `"Synergy Event Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Synergy Event - Registration Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Registration Successful!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>You are officially registered for the <strong>Synergy Event</strong>. We are excited to have you!</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Event Schedule:</h3>
          <ul style="list-style: none; padding-left: 0;">
            <li>☀️ <strong>AM Session:</strong> 9:00 AM – 12:00 PM</li>
            <li>🌙 <strong>PM Session:</strong> 1:00 PM – 5:00 PM</li>
          </ul>
        </div>

        <div style="border-left: 4px solid #f59e0b; padding-left: 15px; margin: 20px 0;">
          <p style="font-weight: bold; color: #b45309;">⚠️ Important Reminders:</p>
          <ul style="padding-left: 20px;">
            ${!isPoster ? `
              <li><strong>Check-in Window:</strong> Attendance begins at <strong>8:00 AM</strong> and closes promptly at <strong>9:00 AM</strong>.</li>
              <li><strong>Slot Policy:</strong> Please arrive early. Any pre-registered slots not claimed by <strong>9:00 AM</strong> will be released and allocated to walk-in participants.</li>
            ` : ''}
            <li><strong>Mandatory Attendance:</strong> You need to make an attendance for both the AM and PM sessions for certificate eligibility.</li>
          </ul>
        </div>

        <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 30px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
};

/**
 * Sends an attendance confirmation email with a unique verification ID
 */
export const sendAttendanceEmail = async (email: string, name: string, sessionType: string, verificationId: string) => {
  const sessionLabel = sessionType.toUpperCase().includes('PM') ? 'Afternoon (PM)' : 'Morning (AM)';
  
  const mailOptions = {
    from: `"Synergy Event Team" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Attendance Verified - ${sessionLabel}`,
    html: `
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Attendance email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending attendance email:', error);
  }
};
