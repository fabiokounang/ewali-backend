const nodemailer = require("nodemailer");

module.exports = async (email) => {
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
  
    // let html = fs.readFileSync('/home/config/emailforgetpass.html', 'utf-8');
    // html = html.replace('REPLACE_USERNAME', email);
    // html = html.replace(/REPLACE_URL_PUBLIC/g, process.env.URL_PUBLIC);
    // html = html.replace('REPLACE_YEAR', new Date().getFullYear().toString());
    // html = html.replace(/REPLACE_HREF/g, 'https://' + process.env.URL + '/forgetpass/setpass/' + code);
    // html = html.replace(/href=""/g, 'href="https://' + process.env.URL + '/forgetpass/setpass/"' + code);
    
    // Step 2
    let mailOptions = {
      from: `E-wali <${process.env.EMAIL}>`,
      to: email,
      cc: email,
      bcc: email,
      subject: 'Aktivasi Akun',
      text: '',
      html: html
    }
    const result = await transporter.sendMail(mailOptions);
    return { status: true }
  } catch (error) {
    return { status: false, error: error }
  }
}