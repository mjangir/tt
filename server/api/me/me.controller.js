'use strict';

import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';

let User = sqldb.User;

/**
 * Get profile
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const index = function(req, res)
{
  logger.debug("Getting user profile....");

  User.find({
    where: {
      id: req.user.user_id
    }
  })
  .then(function(user)
  {
    user = user.get({plain: true});

    delete user.password;
    delete user.salt;

    return res.status(200).json({
      'status': 'success',
      'data': user
    });
  }).catch(sequelizeErrorHandler(res));
};

/**
 * Update profile
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const update = function(req, res)
{

};

/**
 * Get statistics
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const statistics = function(req, res)
{

};

/**
 * Change profile password
 *
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 * @return {*}
 */
const changePassword = function(req, res, next)
{
  const userId  = req.user.user_id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  User.find({
    where: {
      id: userId
    }
  })
  .then(function(user)
  {
    if(user.authenticate(oldPass))
    {
      user.password = newPass;

      return user.save()
        .then(function()
        {
          return res.status(200).json({
            'status': 'success',
            'message': 'Password changed successfully'
          });
        })
        .catch(sequelizeErrorHandler(res));
    }
    else
    {
      return res.status(403).json({
        'status': 'error',
        'code': 403,
        'message': 'You were not authenticated with old password'
      });
    }
  });
};

export default {
  index,
  update,
  statistics,
  changePassword
}