import jwt, { JwtPayload } from "jsonwebtoken";
import { RoleEnum, SignatureEnum, TokinTypeEnum } from "../enums/auth.enum";
import {
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
  TOKEN_ACCESS_ADMIN_SECRET_KEY,
  TOKEN_ACCESS_USER_SECRET_KEY,
  TOKEN_REFRESH_ADMIN_SECRET_KEY,
  TOKEN_REFRESH_USER_SECRET_KEY,
} from "../../config/config.service";
import { uuid } from "zod";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../response/error.response";
import { UserRepository } from "../../DB/repostiories/user.repo";
import { HUserDocument, UserModel } from "../../DB/Models/user.model";
import { get, revokeTokenKey } from "../../DB/redis.service";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  jti: string;
}

export class TokenService {
  private readonly _userRepo = new UserRepository(UserModel);
  constructor() {}

  sign = async (
    payload: object,
    secret: string,
    options?: jwt.SignOptions,
  ): Promise<string> => {
    return jwt.sign(payload, secret, options);
  };

  verify = async (token: string, secret: string): Promise<CustomJwtPayload> => {
    return jwt.verify(token, secret) as CustomJwtPayload;
  };

  getSignature = ({ signtureLevel = SignatureEnum.USER }) => {
    let signature: { accessSignature: string; refreshSignature: string } = {
      accessSignature: "",
      refreshSignature: "",
    };
    switch (signtureLevel) {
      case SignatureEnum.ADMIN:
        signature.accessSignature = TOKEN_ACCESS_ADMIN_SECRET_KEY as string;
        signature.refreshSignature = TOKEN_REFRESH_ADMIN_SECRET_KEY as string;
        break;
      case SignatureEnum.USER:
        signature.accessSignature = TOKEN_ACCESS_USER_SECRET_KEY as string;
        signature.refreshSignature = TOKEN_REFRESH_USER_SECRET_KEY as string;
        break;
      default:
        signature.accessSignature = TOKEN_ACCESS_USER_SECRET_KEY as string;
        signature.refreshSignature = TOKEN_REFRESH_USER_SECRET_KEY as string;
        break;
    }
    return signature;
  };

  getNewLoginCredentials = async (user: { _id: string; role: RoleEnum }) => {
    const signature = await this.getSignature({
      signtureLevel:
        user.role != RoleEnum.ADMIN ? SignatureEnum.USER : SignatureEnum.ADMIN,
    });
    const jwtid = uuid();
    const accessToken = await this.sign(
      { id: user._id, jti: jwtid },
      signature.accessSignature,
      { expiresIn: Number(ACCESS_EXPIRES) },
    );
    const refreshToken = await this.sign(
      { id: user._id, jti: jwtid },
      signature.refreshSignature,
      { expiresIn: Number(REFRESH_EXPIRES) },
    );
    return { accessToken, refreshToken };
  };

  decodedToken = async ({
    authorization,
    tokenType = TokinTypeEnum.ACCESS,
  }: {
    authorization: string;
    tokenType?: TokinTypeEnum;
  }): Promise<{ user: HUserDocument; decoded: CustomJwtPayload }> => {
    if (!authorization)
      throw new BadRequestException("Authorization Header is missing");

    const [Bearer, token] = authorization.split(" ") || [];
    if (!Bearer || !token)
      throw new BadRequestException("Invalid Token Format");

    let signature = await this.getSignature({
      signtureLevel:
        Bearer === "Admin" ? SignatureEnum.ADMIN : SignatureEnum.USER,
    });
    const secret =
      tokenType === TokinTypeEnum.ACCESS
        ? signature.accessSignature
        : signature.refreshSignature;

    const decoded = await this.verify(token, secret);
    const isRevoked = await get({
      key: revokeTokenKey({ userId: decoded.id, jti: decoded.jti }),
    });
    if(!isRevoked) throw new UnauthorizedException("Token is Revoked")
    const user = await this._userRepo.findById({ id: decoded.id });
    if (!user) throw new NotFoundException("Not Registed Account");

    return { user, decoded };
  };
}
