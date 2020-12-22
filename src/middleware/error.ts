import { Response } from 'express';
import { ValidationError } from 'class-validator';

interface ValidationErrorMessage {
  field: string;
  message: string;
}

interface ErrorResponse {
  status: string;
  statusCode: number;
  validationErrors?: ValidationErrorMessage[];
  message: string;
}

interface ErrorParam {
  statusCode: number;
  message: string;
  classValidationErrors?: ValidationError[];
  validationErrors?: ValidationErrorMessage[];
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

export class ClassValidationErrorHandler extends Error {
  statusCode = 422;
  message = 'Validation error';
  classValidationErrors: ValidationError[];
  constructor(validationErrors: ValidationError[]) {
    super();
    this.classValidationErrors = validationErrors;
  }
}

export class ValidationErrorHandler extends Error {
  statusCode = 422;
  message = 'Validation error';
  validationErrors: ValidationErrorMessage[];
  constructor(validationErrors: ValidationErrorMessage[]) {
    super();
    this.validationErrors = validationErrors;
  }
}

export const handleError = (err: ErrorParam, res: Response): void => {
  const { statusCode, message, classValidationErrors, validationErrors } = err;
  let _statusCode = statusCode;
  if (!_statusCode) {
    _statusCode = 500;
  }

  const json: ErrorResponse = {
    status: 'error',
    statusCode: _statusCode,
    message,
  };

  if (classValidationErrors) {
    const errors: ValidationErrorMessage[] = classValidationErrors.map((value) => {
      const message = value.constraints ? Object.values(value.constraints)[0] : 'Field not valid';
      return {
        field: value.property,
        message,
      };
    });

    json.validationErrors = errors;
  } else if (validationErrors) {
    json.validationErrors = validationErrors;
  }

  res.status(_statusCode).json(json);
};
