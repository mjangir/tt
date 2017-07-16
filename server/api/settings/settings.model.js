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
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Setting Key"
    },

    value : {
      field       : "value",
      type        : DataTypes.TEXT('long'),
      allowNull   : true,
      comment     : "Setting Value"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'setting',

    classMethods:{
      associate:function(models){
        
      }
    }
  });

  return Settings;
};
