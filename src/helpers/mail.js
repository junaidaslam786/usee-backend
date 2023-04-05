import { createTransport } from 'nodemailer';

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, DEFAULT_MAIL_SENDER, APP_NAME
} = process.env;

async function getTransporter() {
  const transporter = createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    },
    debug: true
  });
  
  return transporter;
}

export async function sendMail(body) {
  return new Promise(async function (resolve, reject) {
    try {
      // Create transporter
      const transport = await getTransporter();
      const message = {
          from: `${DEFAULT_MAIL_SENDER}`,
          to: body?.to || DEFAULT_MAIL_SENDER,
          subject: body?.subject || "",
          headers: {
            "X-Laziness-level": 1000,
            charset: "UTF-8"
          },
          attachments: [],
          html: body?.html || "Please contact administrator"
      };

      if (body?.attachments?.length) {
          message.attachments = message.attachments.concat(attachments);
      }

      transport.sendMail(message, function (error, response) {
          if (error) {
            console.log('mailErrorInfo', error);
          }

          resolve(true);
      });
    } catch(error) {
      console.log('sendMailError', error);
      return false;
    }
  });
}