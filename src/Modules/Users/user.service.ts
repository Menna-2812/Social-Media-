import { NextFunction, Request, Response } from "express";

class UserService {
  constructor() {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ message: "Done", data: req.user });
  };
}

export default new UserService();