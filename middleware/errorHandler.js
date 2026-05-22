const AppError = require('../utils/appError');

function sendErrorDev(err, req, res) {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorProd(err, req, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('UNEXPECTED ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
}

module.exports = (err, req, res, next) => {
  if (!(err instanceof AppError)) err = new AppError(err.message || 'Error', err.statusCode || 500);

  if (process.env.NODE_ENV === 'production') return sendErrorProd(err, req, res);
  return sendErrorDev(err, req, res);
};
