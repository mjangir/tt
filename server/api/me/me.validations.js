'use strict';

import * as constants from '../../config/constants';

/**
 * Validations for profile get
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const index = function(request, response, next)
{
  next();
}

/**
 * Validations for update profile
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const update = function(request, response, next)
{

  let errors = [];

  // Validate all body parameters
  request.checkBody({
   'name': {
      notEmpty: {
        args: true,
        errorMessage: 'Name cannot be empty',
      }
    },
    'email': {
      isEmail: {
        args: true,
        errorMessage: 'Email is not valid'
      },
    }
  });

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
  request.body.updated_by = request.user.user_id;
  next();
}

/**
 * Profile change password
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {String}
 */
export const changePassword = function(request, response, next)
{
  let errors = [];

  // Validate all body parameters
  request.checkBody({
    'oldPassword': {
      notEmpty: {
        args: true,
        errorMessage: 'Old Password cannot be empty',
      }
    },
    'newPassword': {
      notEmpty: {
        args: true,
        errorMessage: 'New Password cannot be empty',
      },
    }
  });

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
  request.body.updated_by = request.user.user_id;
  next();
};

/**
 * Validations for get statistics
 *
 * @param  {Object}   request
 * @param  {Object}   response
 * @param  {Function} next
 * @return {*}
 */
export const statistics = function(request, response, next)
{
  next();
};