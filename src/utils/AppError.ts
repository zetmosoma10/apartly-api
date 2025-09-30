class AppError extends Error {
  status: number;
  isOperational: boolean;
  errorObj?: object;

  constructor(msg: string, status: number, errorObj?: object) {
    super(msg);
    this.status = status;
    this.isOperational = true;
    this.errorObj = errorObj;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
