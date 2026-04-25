import mongoose, { HydratedDocument, Schema } from "mongoose";
import { GenderEnum, RoleEnum } from "../../Utils/enums/auth.enum";

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
    password: { type: String, required: true },
    confirmEmailOTP: String,
    confirmEmail: Date,
    resetpasswordOTP: String,
    phone: String,
    address: String,
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

export const UserModel = mongoose.model<IUser>("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>