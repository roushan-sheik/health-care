/* eslint-disable no-console */
import config from "../../../config";
import nodemailer from "nodemailer";

const emailSender = async (receiverEmail: string, htmlBody: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: config.emailSender.business_email,
      pass: config.emailSender.app_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Health Care🧑‍⚕️🧑‍⚕️" <roushansheik@gmail.com>', // sender address
    to: receiverEmail, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: htmlBody, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

export default emailSender;
