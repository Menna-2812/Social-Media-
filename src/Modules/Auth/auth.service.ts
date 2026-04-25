import { Request, Response } from "express";
import { SignupDTO, ConfirmEmailDTO } from "./auth.dto";
import { UserModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/repostiories/user.repo";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { compareHash, generateHash } from "../../Utils/Security/hash";
import { encrypt } from "../../Utils/Security/encryption";
import { genereateOTP } from "../../Utils/generateOTP";
import { emailEvent } from "../../Utils/events/email.events";

class AuthenticationService {
  private _userModel = new UserRepository(UserModel);
  constructor() {}
  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, phone }: SignupDTO = req.body;

    const checkUser = await this._userModel.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictException("User Already Exists");
    const otp = genereateOTP();

    const user = await this._userModel.create({
      data: [
        {
          username,
          email,
          password: await generateHash(password),
          phone: await encrypt(phone),
          confirmEmailOTP: await generateHash(otp),
        },
      ],
      options: { validateBeforeSave: true },
    });

    await emailEvent.emit("confirmEmail", { to: email, otp });

    return res.status(200).json({ message: "User Created", data: { user } });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: ConfirmEmailDTO = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmEmail: { $exists: false },
      },
    });
    if (!user) throw new NotFoundException("User Not Found | Aready Confirmed");
    if (!compareHash(otp, user?.confirmEmailOTP as string))
      throw new BadRequestException("Invalid OTP");

    await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmEmail: new Date(),
        $unset: { confirmEmailOTP: true },
      },
    });

    return res
      .status(200)
      .json({ message: "User Confirmed Successfully" });
  };
}
export default new AuthenticationService();
