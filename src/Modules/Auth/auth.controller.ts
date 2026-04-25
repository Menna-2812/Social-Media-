import { Router } from "express";
import authService from "./auth.service";
import * as authValidation from "./auth.validation";
import { validation } from "../../Middleware/validation.middleware";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.SignupSchema),
  authService.signup,
);

router.post(
  "/confirm-email",
  validation(authValidation.ConfirmEmailSchema),
  authService.confirmEmail,
);

export default router;
