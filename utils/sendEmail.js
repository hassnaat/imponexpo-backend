const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Send mail with defined transport object
  let message = {
    from: `"LABEASE" <${process.env.SENDER_EMAIL_ADDRESS}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
};

module.exports = sendEmail;
