import { Request, Response } from "express";
import { SignupDTO, ConfirmEmailDTO, LoginDTO } from "./auth.dto";
import { UserModel } from "../../DB/Models/user.model";
import { UserRepository } from "../../DB/repostiories/user.repo";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { compareHash, generateHash } from "../../Utils/Security/hash";
import { generateOTP } from "../../Utils/generateOTP";
import { TokenService } from "../../Utils/services/token";
import { LogoutTypeEnum, ProviderEnum } from "../../Utils/enums/auth.enum";
import { revokeTokenKey, set } from "../../DB/redis.service";
import { ACCESS_EXPIRES, CLIENT_ID } from "../../config/config.service";
import { OAuth2Client } from "google-auth-library";

class AuthenticationService {
  private _userRepo = new UserRepository(UserModel);
  private _tokenService: TokenService;
  constructor() {
    this._tokenService = new TokenService();
  }
  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, phone }: SignupDTO = req.body;

    const checkUser = await this._userRepo.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictException("User Already Exists");
    const otp = generateOTP();

    const user = await this._userRepo.create({
      data: [
        {
          username,
          email,
          password,
          phone,
          confirmEmailOTP: await generateHash(otp),
        },
      ],
      options: { validateBeforeSave: true },
    });

    return res.status(200).json({ message: "User Created", data: { user } });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: ConfirmEmailDTO = req.body;

    const user = await this._userRepo.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmEmail: { $exists: false },
      },
    });
    if (!user) throw new NotFoundException("User Not Found | Aready Confirmed");
    if (!compareHash(otp, user?.confirmEmailOTP as string))
      throw new BadRequestException("Invalid OTP");

    await this._userRepo.updateOne({
      filter: { email },
      update: {
        confirmEmail: new Date(),
        $unset: { confirmEmailOTP: true },
      },
    });

    return res.status(200).json({ message: "User Confirmed Successfully" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: LoginDTO = req.body;
    const user = await this._userRepo.findOne({
      filter: { email, confirmEmail: { $exists: true } },
    });
    if (!user) throw new NotFoundException("User Not Found OR Not Confirmed");
    if (!(await compareHash(password, user.password)))
      throw new BadRequestException("Invalid Email OR Password");
    const credentials = await this._tokenService.getNewLoginCredentials(
      user as any,
    );

    return res
      .status(200)
      .json({ message: "Login SuccessFully", data: { credentials } });
  };

  logoutWithRedis = async (req: Request, res: Response): Promise<Response> => {
    const { flag } = req.body;
    let status = 200;
    switch (flag) {
      case LogoutTypeEnum.LOGOUT:
        await set({
          key: revokeTokenKey({ userId: req.decoded.id, jti: req.decoded.jti }),
          value: req.decoded.jti,
          ttl: Number(ACCESS_EXPIRES),
        });
        status = 201;
        break;
      case LogoutTypeEnum.LOGOUT_FROM_ALL:
        await this._userRepo.updateOne({
          filter: { _id: req.decoded.id },
          update: {
            changeCredentialsTime: Date.now(),
          },
        });
        status = 200;
        break;
    }

    return res
      .status(status)
      .json({ message: "Logout SuccessFully" });
  };

  verifyGoogleAccount = async ({ idToken }: {idToken: string}) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  
  loginWithGoogle = async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const { email, picture, given_name, family_name, email_verified }: any =
      await this.verifyGoogleAccount({ idToken });
    if (!email_verified)
      throw new BadRequestException( "Email Not Verfied" );
    const user = await this._userRepo.findOne({ filter: { email } });
    if (user) {
      if (user.provider === ProviderEnum.GOOGLE) {
        const credentials = await this._tokenService.getNewLoginCredentials(
      user as any,
    );
    return res
      .status(200)
      .json({ message: "Login SuccessFully", data: { credentials } });
      }
    }
    // Create User
    const newUser = await this._userRepo.create({
      data: [
        {
          firstName: given_name,
          lastName: family_name,
          email: email,
          profilePic: picture,
          provider: ProviderEnum.GOOGLE,
        },
      ],
    });
    const credientials = await this._tokenService.getNewLoginCredentials(
      newUser as any,
    );
    return res
      .status(201)
      .json({ message: "Login SuccessFully", data: { credientials } });
  };
}
export default new AuthenticationService();