import { EventEmitter } from "node:events";
import { template } from "./../email/generateHTML.js";
import { sendEmail } from "../../Utils/email/email.utils.js";
import Mail from "nodemailer/lib/mailer/index.js";

export const emailEvent = new EventEmitter();
interface IEmail extends Mail.Options {
  otp: string;
  username: string;
}

emailEvent.on("confirmEmail", async (data: IEmail) => {
  try {
    data.subject = "Confirm Your Email";
    data.html = template(data.otp, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.log("Fail to send Email", error);
  }
});

