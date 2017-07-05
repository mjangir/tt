'use strict';

import * as constants from '../../config/constants';

// Validate get all department request
export const index = function(request, response, next) {
  next();
}

// Validate get a single department request
export const show = function(request, response, next) {

  let errors = null;

  // Check if provided department ID is an integer
  request.checkParams('id', 'Invalid Department ID').isInt();

  // Get all validation errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors) {
    response.status(400);
    response.json({
      status: 'error',
      code: constants.BAD_REQUEST.code,
      message: constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }

  // Pass to the next middleware
  next();
}

// Validate create or update department request
export const createOrUpdate = function(request, response, next) {

  let errors = null;

  // Validate all body parameters
  request.checkBody({
   'departmentName': {
      notEmpty: true,
      errorMessage: 'Department Name cannot be empty'
    },
    'departmentCode': {
      notEmpty: true,
      errorMessage: 'Department Code cannot be empty'
    },
    'description': {
      optional: true,
      isLength: {
        options: [{ min: 2, max: 160 }],
        errorMessage: 'Description must be between 2 to 160 characters'
      }
    },
    'status':{
      isIn: {
          options: ['ACTIVE','INACTIVE','DELETED'],
          errorMessage: 'Status must be Active, Inactive or deleted'
      }
    }
  });

  // Get all error messages
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors) {
    response.status(422);
    response.json({
      status: 'error',
      code: constants.VALIDATION_ERROR.code,
      message: constants.VALIDATION_ERROR.message,
      errors
    }).end();
    return null;
  }

  request.body.created_by = request.user.user_id;
  request.body.updated_by = request.user.user_id;
  request.body.company_id = request.user.company_id;

  // Pass to the next middleware
  next();
}

// Validate delete department request
export const destroy = function(request, response, next) {

  let errors = null;

  // Check if Department ID is integer
  request.checkParams('id', 'Invalid Department ID').isInt();

  // Get all errors
  errors = request.validationErrors();

  // Send errors as JSON response if any
  if(errors) {
    response.status(400);
    response.json({
      status: 'error',
      code: constants.BAD_REQUEST.code,
      message: constants.BAD_REQUEST.message,
      errors
    }).end();
    return null;
  }
  next();
}
