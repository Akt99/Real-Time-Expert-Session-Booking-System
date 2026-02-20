import { StatusCodes } from 'http-status-codes';

export const notFound = (_req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: 'Route not found'
  });
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    message: err.message || 'Something went wrong',
    details: err.details || null
  });
};
