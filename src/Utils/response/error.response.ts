import { Request, Response, NextFunction } from "express";

export interface IError extends Error {
  statusCode?: number;
}

export class ApplicationError extends Error {
  constructor(
    message: string,
    options?: ErrorOptions,
    public statusCode: number = 400,
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends ApplicationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 400);
  }
}

export class NotFoundException extends ApplicationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 404);
  }
}

export class ConflictException extends ApplicationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 409);
  }
}

export class ForbiddenException extends ApplicationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 403);
  }
}

export class UnauthorizedException extends ApplicationError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options, 403);
  }
}

export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(err.statusCode || 500)
    .json({ 
        message: err.message || "Something Went Wrong", 
        stack: err.stack,
        cause: err.cause
    });
};
