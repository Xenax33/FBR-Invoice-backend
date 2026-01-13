import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    throw new AppError(
      JSON.stringify(errorMessages),
      400
    );
  }
  
  next();
};
