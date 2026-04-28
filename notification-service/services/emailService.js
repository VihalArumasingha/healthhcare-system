const transporter = require("../config/mailConfig");

exports.sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log("Email sent to", to);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};