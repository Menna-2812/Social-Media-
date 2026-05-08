import { Router } from "express";
import authService from "./auth.service";
import * as authValidation from "./auth.validation";
import { validation } from "../../Middleware/validation.middleware";
import { authentication } from "../../Middleware/authentication.middleware";
import { TokinTypeEnum } from "../../Utils/enums/auth.enum";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.SignupSchema),
  authService.signup,
);

router.post(
  "/login",
  validation(authValidation.LoginSchema),
  authService.login,
);

router.patch(
  "/logout",
  authentication({tokenType: TokinTypeEnum.ACCESS}),
  validation(authValidation.LogoutSchema),
  authService.logoutWithRedis,
);

router.post(
  "/confirm-email",
  validation(authValidation.ConfirmEmailSchema),
  authService.confirmEmail,
);

router.post("/social-login", authService.loginWithGoogle);

export default router;
