const nodemailer = require("nodemailer");

module.exports = async (email, token, subUrl) => {
  try {
    // Step 1
    let transporter = nodemailer.createTransport({
      host: process.env.HOST_EMAIL,
      port: process.env.PORT_EMAIL,
      service: 'Mailjet',
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: true
    });

    // Step 2
    let mailOptions = {
      from: `E-wali <${process.env.EMAIL}>`,
      to: email,
      subject: 'Aktivasi Akun',
      text: process.env.URL_FRONTEND + subUrl + '/' + token,
      html: `<p>${process.env.URL_FRONTEND + subUrl + '/' + token}</p>`
    }

    const result = await transporter.sendMail(mailOptions);
    return { status: true }
  } catch (error) {
    return { status: false, error: error }
  }
}