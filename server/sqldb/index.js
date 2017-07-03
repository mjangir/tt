'use strict';

import path from 'path';
import config from '../config/environment';
import Sequelize from 'sequelize';
import logger from '../utils/logger';

// Log SQL queries if logging is true
if(config.sequelize.logging === true)
{
  config.sequelize.options.logging = function(message)
  {
    logger.info(message);
  }
}

// Create new Sequelize connection instance
const sequelizeConnection = new Sequelize(config.sequelize.database, null, null, config.sequelize.options);

// Data for expose
const db = {
  Sequelize: Sequelize,
  sequelize: sequelizeConnection
};

// Import Sequelize models
db.User = db.sequelize.import('../api/user/user.model');

// Model Associations for Sequelize
Object.keys(db).forEach(function(modelName)
{
  if(db[modelName].hasOwnProperty('associate'))
  {
    db[modelName].associate(db);
  }
});

export default db;
