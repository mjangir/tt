'use strict';

import _ from 'lodash';
import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import {generateRandomString} from '../../utils/functions';
import * as constants from '../../config/constants';

var Jackpot = sqldb.Jackpot;


/**
 * Response With Result
 *
 * @param  {Object} res
 * @param  {Object} statusCode
 * @return {String}
 */
function responseWithResult(res, statusCode)
{
  statusCode = statusCode || 200;
  return function(entity)
  {
    if(entity)
    {
      res.status(statusCode).json({
        status: 'success',
        data: entity
      }).end();
    }
  };
}

/**
 * Handle Entity Not Found
 *
 * @param  {Object} res
 * @return {String}
 */
function handleEntityNotFound(res) {
  return function(entity)
  {
    if(!entity)
    {
      res.status(404).json({
        status: 'error',
        code: constants.NOT_FOUND.code,
        message: constants.NOT_FOUND.message
      });
      return null;
    }
    return entity;
  };
}

/**
 * Handle Save Updates
 *
 * @param  {Object} updates
 * @return {String}
 */
function saveUpdates(updates)
{
  return function(entity)
  {
    return entity.updateAttributes(updates)
      .then(function(updated) {
        return updated;
      });
  };
}

/**
 * Remove Entity
 *
 * @param  {Object} res
 * @return {*}
 */
function removeEntity(res)
{
  return function(entity)
  {
    if(entity)
    {
      return entity.destroy()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

/**
 * Get All Jackpots
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {String}
 */
exports.index = function(req, res)
{
  logger.debug("Trying to find list of all jackpots.");
  Jackpot.findAll({
    include: [
      {
        model: sqldb.JackpotGame,
        as: 'JackpotGames',
        required: false,
        include: [
          {
            model: sqldb.User,
            as: 'LongestBidWinnerUser',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: sqldb.User,
            as: 'LastBidWinnerUser',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: sqldb.JackpotGameUser,
            as: 'JackpotGameUsers',
            required: false,
            include: [
              {
                model: sqldb.JackpotGameUserBid,
                as: 'JackpotGameUserBids',
                required: false,
                attributes: ['bidStartTime', 'bidEndTime', 'bidDuration']
              }
            ]
          }
        ]
      }
    ]
  })
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Get Single Jackpot
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.show = function(req, res)
{
  logger.debug("Trying to find a jackpot.");
  Jackpot.find({
    where: {
      id: req.params.id
    },
    include: [
      {
        model: sqldb.JackpotGame,
        as: 'JackpotGames',
        required: false,
        include: [
          {
            model: sqldb.User,
            as: 'LongestBidWinnerUser',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: sqldb.User,
            as: 'LastBidWinnerUser',
            required: false,
            attributes: ['id', 'name', 'email']
          },
          {
            model: sqldb.JackpotGameUser,
            as: 'JackpotGameUsers',
            required: false,
            include: [
              {
                model: sqldb.JackpotGameUserBid,
                as: 'JackpotGameUserBids',
                required: false,
                attributes: ['bidStartTime', 'bidEndTime', 'bidDuration']
              }
            ]
          }
        ]
      }
    ]
  })
  .then(handleEntityNotFound(res))
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Create A Jackpot
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.create = function(req, res)
{

  logger.debug("Create Jackpot initializated");

  if(req.body.gameClockRemaining)
  {
    delete req.body.gameClockRemaining;
  }

  if(req.body.doomsDayRemaining)
  {
    delete req.body.doomsDayRemaining;
  }

  req.body.gameClockRemaining = req.body.gameClockTime;
  req.body.doomsDayRemaining  = req.body.doomsDayTime;
  req.body.uniqueId           = generateRandomString(20, 'aA');

  Jackpot.create(req.body)
    .then(responseWithResult(res, 201))
    .catch(sequelizeErrorHandler(res));
};

/**
 * Update A Jackpot
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.update = function(req, res)
{

  if(req.body.id)
  {
    logger.debug("If jackpot id is found in body, delete it");
    delete req.body.id;
  }

  if(req.body.gameClockRemaining)
  {
    delete req.body.gameClockRemaining;
  }

  if(req.body.doomsDayRemaining)
  {
    delete req.body.doomsDayRemaining;
  }

  if(req.body.uniqueId)
  {
    delete req.body.uniqueId;
  }

  logger.debug("Finding jackpot with given ID");
  Jackpot.find({
    where: {
      id: 1
    }
  })
  .then(handleEntityNotFound(res))
  .then(saveUpdates(req.body))
  .then(responseWithResult(res))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Delete A Jackpot
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
exports.destroy = function(req, res)
{
  logger.debug("Finding jackpot with given ID");
  Jackpot.find({
    where: {
      id: req.params.id
    }
  })
  .then(handleEntityNotFound(res))
  .then(removeEntity(res))
  .catch(sequelizeErrorHandler(res));
};
