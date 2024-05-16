const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmailUtil(options) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `
        <p>Este es un ejemplo de correo electrónico con una imagen incrustada:</p>
        <p><img src="cid:imagen001"></p>
      `,
      attachments: [{
        filename: 'photo_5d725a1b7b292f5f8ceff788.png',
        path: './src/public/uploads/photo_5d725a1b7b292f5f8ceff788.png',
        cid: 'imagen001'
      }]   
    });
  
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmailUtil;
