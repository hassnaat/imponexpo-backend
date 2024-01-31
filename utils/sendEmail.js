// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // secure: process.env.EMAIL_SECURE,
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Send mail with defined transport object
  let message = {
    from: `"IMPONEXPO" <${process.env.SENDER_EMAIL_ADDRESS}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    // html: "<b>Hello world?</b>", // html body
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
