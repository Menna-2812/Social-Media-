import { createTransport, Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { USER_EMAIL, USER_PASSWORD } from "../../config/config.service";
import SMTPTransport from "nodemailer/lib/smtp-transport/index";
import { BadRequestException } from "../response/error.response";

export const sendEmail = async (data: Mail.Options): Promise<any> => {
  if(!data.html && !data.attachments && !data.text){
    throw new BadRequestException("Missing Email Content")
  }
  const transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  > = createTransport({
    service: "gmail",
    auth: {
      user: USER_EMAIL as string,
      pass: USER_PASSWORD as string,
    },
  });
  const info = await transporter.sendMail({
    ...data,
    from: `Social Media App: <${USER_EMAIL as string}> `,
  });
  console.log(info.messageId);
};
