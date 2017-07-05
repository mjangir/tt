'use strict';

module.exports = function(sequelize, DataTypes)
{
  var UserJackpotBid = sequelize.define('UserJackpotBid', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    userJackpotId : {
      field       : "user_jackpot_id",
      type        : DataTypes.INTEGER(11),
      allowNull   : false,
      comment     : "User Jackpot ID"
    },

    bidStartTime : {
      field         : "bid_start_time",
      type          : DataTypes.DATE,
      allowNull     : false,
      comment       : "Bid start time"
    },

    bidEndTime : {
      field         : "bid_end_time",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "Bid end time"
    },

    bidDuration : {
      field         : "bid_duration",
      type          : DataTypes.INTEGER(11),
      allowNull     : true,
      defaultValue  : 0,
      comment       : "Duration of bid in seconds"
    },
  },
  {
    freezeTableName   : true,
    tableName         : 'user_jackpot_bids',

    classMethods:{
      associate:function(models){
        UserJackpotBid.belongsTo(models.UserJackpot, {
          as          : 'UserJackpot',
          foreignKey  : {
            name      : 'user_jackpot_id',
            allowNull : false
          }
        });
      }
    }
  });

  return UserJackpotBid;
};
