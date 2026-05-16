import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the current directory
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('--- Email Config Test ---');
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? '******** (Hidden)' : 'MISSING');
console.log('Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
console.log('Port:', process.env.SMTP_PORT || '587');
console.log('-------------------------');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log('Attempting to connect to Gmail...');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection Failed!');
    console.error('Error Details:', error.message);
    if (error.message.includes('Invalid login') || error.message.includes('Authentication failed')) {
      console.log('\nTIP: "Invalid login" usually means your App Password is wrong or you haven\'t enabled 2-Step Verification.');
    }
  } else {
    console.log('✅ Connection Successful! Your credentials are correct.');
    
    console.log('Sending a test email to yourself...');
    transporter.sendMail({
      from: `"Synergy Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Synergy Test Email',
      text: 'If you see this, your email system is working perfectly!',
    }).then(() => {
      console.log('🚀 Test email sent! Check your inbox (and Spam folder).');
      process.exit(0);
    }).catch(err => {
      console.error('❌ Failed to send test email:', err.message);
      process.exit(1);
    });
  }
});
