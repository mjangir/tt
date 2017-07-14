'use strict';

module.exports = function(sequelize, DataTypes)
{
  var Jackpot = sequelize.define('Jackpot', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    title : {
      field       : "title",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Jackpot Title"
    },

    amount : {
      field       : "amount",
      type        : DataTypes.DECIMAL(10,2),
      allowNull   : false,
      comment     : "Jackpot Winning Amount"
    },

    gameClockTime : {
      field         : "game_clock_time",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Game Clock Time (in seconds)"
    },

    doomsDayTime : {
      field         : "dooms_day_time",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Dooms Day Clock Time (in seconds)"
    },

    gameClockRemaining : {
      field         : "game_clock_remaining",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Game Clock Remaining Time (in seconds)"
    },

    doomsDayRemaining : {
      field         : "dooms_day_remaining",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Dooms Day Remaining Clock Time (in seconds)"
    },

    gameStatus: {
      field         : "game_status",
      type          : DataTypes.ENUM('NOT_STARTED','STARTED', 'FINISHED'),
      allowNull     : false,
      defaultValue  : 'NOT_STARTED',
      comment       : "Jackpot game status"
    },

    uniqueId  : {
      field       : "unique_id",
      type        : DataTypes.STRING(32),
      allowNull   : false,
      comment     : "Jackpot Unique ID"
    },

    startedOn : {
      field         : "started_on",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "It will have datetime as soon as the game status goes to STARTED"
    },

    status: {
      field         : "status",
      type          : DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull     : false,
      defaultValue  : 'ACTIVE',
      comment       : "Weather a Jackpot is active, inactive or deleted"
    },
  },
  {
    freezeTableName   : true,
    tableName         : 'jackpots',

    classMethods:{
      associate:function(models){
        Jackpot.belongsTo(models.User, {
          as          : 'CreatedByUser',
          constraints : false,
          foreignKey  : {
            name      : 'createdBy',
            field     : 'created_by',
            allowNull : true
          }
        });

        Jackpot.belongsTo(models.User, {
          as          : 'UpdatedByUser',
          constraints : false,
          foreignKey  : {
            name      : 'updatedBy',
            field     : 'updated_by',
            allowNull : true
          }
        });

        Jackpot.hasMany(models.JackpotGame, {
          as          : 'JackpotGames',
          constraints : false,
          foreignKey  : {
            name      : 'jackpotId',
            field     : 'jackpot_id',
            allowNull : false
          }
        });
      }
    },
    defaultScope: {
      where: {
        status: 'ACTIVE'
      }
    },
    scopes: {
      started: {
        where: {
          status: 'STARTED'
        }
      }
    }
  });

  return Jackpot;
};
