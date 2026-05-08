import { LoginSchema, SignupSchema, ConfirmEmailSchema, LogoutSchema } from "./auth.validation";
import {z} from "zod";

export type SignupDTO = z.infer<typeof SignupSchema.body>;
export type LoginDTO = z.infer<typeof LoginSchema.body>;
export type ConfirmEmailDTO = z.infer<typeof ConfirmEmailSchema.body>;
export type ILogoutDTO = z.infer<typeof LogoutSchema.body>;

