import { Response } from 'express';

interface ErrorParam {
  statusCode: number;
  message: string;
}

export class ErrorHandler extends Error {
  statusCode = 500;
  message = 'Error Happened';
  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const handleError = (err: ErrorParam, res: Response): void => {
  const { statusCode, message } = err;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};
