import { Express, Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter, userRouter, postRouter, commentRouter } from "./Modules";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/response/error.response";
import { PORT } from "./config/config.service";
import { corsOptions } from "./Utils/Cors/cors.utils";
import { customRateLimitter } from "./Utils/rateLimitter/rateLimitter";
import connectDB from "./DB/connection";


export const bootstrap = async () => {
  const app: Express = express();
  app.use(express.json(), cors(corsOptions), helmet(), customRateLimitter);

  await connectDB();
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/comments", commentRouter);
  app.use(globalErrorHandler);

  app.all("/*dummy", (req: Request, res: Response): Response => {
    throw new NotFoundException("Not Found Handler");
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
// DTO: Data Transfaer Object





