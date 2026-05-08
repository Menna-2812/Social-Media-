import { z } from "zod";
import { generalFields } from "../../Middleware/validation.middleware";
import { LogoutTypeEnum } from "../../Utils/enums/auth.enum";

export const LoginSchema = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
  }),
};

export const ConfirmEmailSchema = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};

export const LogoutSchema = {
  body: z.strictObject({
   flag: z.enum(LogoutTypeEnum)
  }),
};

export const SignupSchema = {
  body: LoginSchema.body
    .extend({
      username: generalFields.username,
      confirmPassword: generalFields.confirmPassword,
      phone: z.string(),
      gender: generalFields.gender.optional(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Confirm Password must match Password",
        });
      }
      if (data.username?.split(" ").length !== 2) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "username must be 2 words",
        });
      }
    }),
};
