import { NextFunction, Response, Request } from "express";
import { ZodError, ZodType, z } from "zod";
import { BadRequestException } from "../Utils/response/error.response";

type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validationError: Array<{
      key: KeyReqType;
      issues: Array<{
        message: string;
        path: (string | number | symbol)[];
        code: string;
      }>;
    }> = [];
    for (const key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;

      const validationResult = schema[key].safeParse(req[key as KeyReqType]);
      if (!validationResult.success) {
        const errors = validationResult.error as ZodError;
        validationError.push({
          key,
          issues: errors.issues.map((issue) => {
            return {
              message: issue.message,
              path: issue.path,
              code: issue.code,
            };
          }),
        });
      }
    }
    if (validationError.length > 0) {
      throw new BadRequestException("Validation Error", {
        cause: validationError,
      });
    }
    return next() as unknown as NextFunction;
  };
};

export const generalFields = {
  username: z
    .string({ error: "username is required" })
    .min(3, { error: "username must be at least 3 characters" })
    .max(20, { error: "username must be at most 20 characters" }),
  confirmPassword: z.string({ error: "Confirm Password must be a string" }),
  email: z.email({ error: "Email is required" }),
  password: z.string({ error: "Password must be a string" }),
  gender: z.enum(["MALE", "FEMALE"], {
    error: "Gender must be either Male of Female",
  }),
  otp: z.string().regex(/^\d{6}$/)
};
