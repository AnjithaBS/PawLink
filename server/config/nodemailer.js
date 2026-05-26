import nodemailer from 'nodemailer';

let transporter;

export const initNodemailer = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('Nodemailer custom SMTP transporter initialized.');
  } else {
    try {
      // Attempt to create Ethereal test account (requires internet connection)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`Nodemailer Ethereal test account initialized. User: ${testAccount.user}`);
    } catch (error) {
      // Local development mock fallback
      console.log('Nodemailer offline/mock mode activated. Emails will be logged to console.');
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n=======================================');
          console.log('           MOCK EMAIL SENT');
          console.log(`To:      ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log('---------------------------------------');
          console.log(`Text Body:\n${mailOptions.text}`);
          console.log('=======================================\n');
          return { messageId: 'mock-id-' + Math.floor(Math.random() * 100000) };
        }
      };
    }
  }
};

export const sendEmail = async (to, subject, text, html) => {
  if (!transporter) {
    await initNodemailer();
  }
  
  const mailOptions = {
    from: '"PawLink Platform" <alerts@pawlink.org>',
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (info.messageId && !info.messageId.startsWith('mock-')) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Email Alert Sent! Ethereal Preview URL: ${previewUrl}`);
      } else {
        console.log(`Email Alert Sent to ${to}. Message ID: ${info.messageId}`);
      }
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};
