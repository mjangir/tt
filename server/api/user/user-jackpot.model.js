'use strict';

module.exports = function(sequelize, DataTypes)
{
  var UserJackpot = sequelize.define('UserJackpot', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    userId : {
      field       : "user_id",
      type        : DataTypes.INTEGER(11),
      allowNull   : false,
      comment     : "Bidding User ID"
    },

    jackpotId : {
      field       : "jackpot_id",
      type        : DataTypes.INTEGER(11),
      allowNull   : false,
      comment     : "Jackpot ID"
    },

    status : {
      field         : "status",
      type          : DataTypes.ENUM('NOT_STARTED','STARTED','QUITTED', 'FINISHED'),
      allowNull     : false,
      defaultValue  : 'NOT_STARTED',
      comment       : "User Jackpot Status"
    },

    availableBids : {
      field         : "available_bids",
      type          : DataTypes.INTEGER(11),
      defaultValue  : 0,
      allowNull     : false,
      comment       : "Available bids"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'user_jackpots',

    classMethods:{
      associate:function(models){
        UserJackpot.belongsTo(models.Jackpot, {
          as          : 'Jackpot',
          foreignKey  : {
            name      : 'jackpot_id',
            allowNull : false
          }
        });
        
        UserJackpot.belongsTo(models.User, {
          as          : 'BidUser',
          foreignKey  : {
            name      : 'user_id',
            allowNull : false
          }
        });
      }
    }
  });

  return UserJackpot;
};
