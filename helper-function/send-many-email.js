const nodemailer = require("nodemailer");

module.exports = async (adminEmails, userEmail) => {
  try {
    // Step 1
    let transporter = await nodemailer.createTransport({
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
      to: adminEmails,
      cc: adminEmails,
      bcc: adminEmails,
      subject: 'Aktivasi Akun',
      text: userEmail + ' berhasil mendaftar di aplikasi !',
      html: ''
    }
    const result = await transporter.sendMail(mailOptions);
    console.log(result, 'success many');
    return { status: true }
  } catch (error) {
    console.log(error, 'error many')
    return { status: false, error: error }
  }
}