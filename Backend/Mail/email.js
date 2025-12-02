import nodemailer from "nodemailer"
const transporter = nodemailer.createTransport({
    service: "gmail",
				host: "smtp.gmail.com",
				port: 587,
				secure: false,
				auth: {
					user: process.env.MAIL_USER,
					pass: process.env.MAIL_PASSWORD,
				},
})
export const sendEmail = async(to,subject,html)=>{
    try {
        await transporter.sendMail({
             from: `"My Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
        })
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error);
  }
};