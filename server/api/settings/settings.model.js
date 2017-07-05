'use strict';

module.exports = function(sequelize, DataTypes)
{
  var Settings = sequelize.define('Settings', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    key : {
      field       : "key",
      type        : DataTypes.STRING(100),
      allowNull   : false,
      comment     : "Setting Key"
    },

    value : {
      field       : "value",
      type        : DataTypes.STRING(100),
      allowNull   : true,
      comment     : "Setting Value"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'settings',

    classMethods:{
      associate:function(models){
        
      }
    }
  });

  return Settings;
};
