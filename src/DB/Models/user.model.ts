import mongoose, { HydratedDocument, Schema } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/enums/auth.enum";
import { generateHash } from "../../Utils/Security/hash";
import { encrypt } from "../../Utils/Security/encryption";
import { emailEvent } from "../../Utils/events/email.events";
import { generateOTP } from "../../Utils/generateOTP";

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;

  email: string;
  confirmEmailOTP: string;
  confirmEmail?: Date;

  password: string;
  resetpasswordOTP?: string;

  phone: string;
  address?: string;

  gender: GenderEnum;
  role?: RoleEnum;
  provider?: ProviderEnum;

  changeCredentialsTime: Date;
  profilePic: string;

  createAt: Date;
  updateAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function (): boolean {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    confirmEmailOTP: String,
    confirmEmail: Date,
    resetpasswordOTP: String,
    phone: {
      type: String,
      required: true,
    },
    address: String,
    changeCredentialsTime: Date,
    profilePic: String,

    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.pre(
  "save",
  async function (this: HUserDocument & { wasBew: boolean }) {
    this.wasBew = this.isNew;
    if (this.isModified("password")) {
      this.password = await generateHash(this.password);
    }
    if (this.isModified("phone")) {
      this.phone = await encrypt(this.phone);
    }
  },
);

userSchema.post("save", async function () {
  const that = this as HUserDocument & { wasBew: boolean };
  if (that.wasBew) {
    await emailEvent.emit("confirmEmail", {
      otp: generateOTP(),
      to: this.email,
    });
  }
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
