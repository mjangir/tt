'use strict';

import * as constants from '../../config/constants';

// Validate get all users request
export const index = function(request, response, next)
{
  next();
}

// Validate get a single user request
export const show = function(request, response, next)
{
  let errors = null;

  // Check if provided user ID is an integer
  request.checkParams('id', 'Invalid User ID').isInt();

  // Get all validation errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(400);
    response.json({
      status  : 'error',
      code    : constants.BAD_REQUEST.code,
      message : constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  next();
}

// Validate create or update user request
export const createOrUpdate = function(request, response, next)
{

  let errors = [];

  // Validate all body parameters
  request.checkBody({
   'firstName': {
      notEmpty: {
        args: true,
        errorMessage: 'First Name cannot be empty',
      },
      isLength: {
        options: [{ min: 1, max: 30 }],
        errorMessage: 'First Name must be between 1 to 30 characters'
      }
    },
    'lastName': {
      optional: true,
      isLength: {
        options: [{ min: 1, max: 30 }],
        errorMessage: 'Last Name must be between 1 to 30 characters'
      }
    },
    'email': {
      isEmail: {
        args: true,
        errorMessage: 'Email is not valid'
      },
    }
  });

  if(request.method === 'POST')
  {
    request.checkBody('password', 'Invalid Password').notEmpty().withMessage('Password can not be empty');
  }

  // Get all error messages
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(422);
    response.json({
      status  : 'error',
      code    : constants.VALIDATION_ERROR.code,
      message : constants.VALIDATION_ERROR.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  request.body.created_by = request.user.user_id;
  request.body.updated_by = request.user.user_id;
  next();
}

// Validate delete user request
export const destroy = function(request, response, next)
{
  let errors = [];

  // Check if user ID is integer
  request.checkParams('id', 'Invalid User ID').isInt();

  // Get all errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors)
  {
    response.status(400);
    response.json({
      status  : 'error',
      code    : constants.BAD_REQUEST.code,
      message : constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }
  next();
}
