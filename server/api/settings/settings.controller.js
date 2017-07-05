'use strict';

import _ from 'lodash';
import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';

var Department = sqldb.Department;

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      res.status(statusCode).json({
        status: 'success',
        data: entity
      }).end();
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
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

function saveUpdates(updates) {
  return function(entity) {
    return entity.updateAttributes(updates)
      .then(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Departments
exports.index = function(req, res) {
  logger.debug("Trying to find list of all departments.");
  Department.findAll()
    .then(responseWithResult(res))
    .catch(sequelizeErrorHandler(res));
};

// Gets a single Department from the DB
exports.show = function(req, res) {
  logger.debug("Trying to find a department.");
  Department.find({
    where: {
      id: req.params.id
    },
    include: [
              { model: sqldb.User, as: 'CreatedByUser', attributes: ['id', 'first_name', 'last_name'] },
              { model: sqldb.User, as: 'UpdatedByUser', attributes: ['id', 'first_name', 'last_name'] }
            ]
  })
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(sequelizeErrorHandler(res));
};

// Creates a new Department in the DB
exports.create = function(req, res) {
  logger.debug("Create Department initializated");
  Department.create(req.body)
    .then(responseWithResult(res, 201))
    .catch(sequelizeErrorHandler(res));
};

// Updates an existing Department in the DB
exports.update = function(req, res) {

  if(req.body.id){
    logger.debug("If department id is found in body, delete it");
    delete req.body.id;
  }

  logger.debug("Finding department with given ID");
  Department.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(sequelizeErrorHandler(res));
};

// Deletes a Department from the DB
exports.destroy = function(req, res) {
  logger.debug("Finding department with given ID");
  Department.find({
    where: {
      id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(sequelizeErrorHandler(res));
};
