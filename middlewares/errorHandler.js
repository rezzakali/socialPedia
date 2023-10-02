import ErrorResponse from '../utility/error.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // duplicate key value error
  if (err.code === 11000) {
    const message = `Duplicate value not allowed!`;
    error = new ErrorResponse(message, 400);
    res.status(400).json({ success: false, error: error.message });
  }
  // mongoDB || validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
    res.status(400).json({ success: false, error: error.message });
  }

  // Call next to pass the error to the next error handler
  next();
};

export default errorHandler;
