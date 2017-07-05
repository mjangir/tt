'use strict';

import crypto from 'crypto';
const authTypes = ['facebook'];

const isValidLength = function(value)
{
  return value && value.length;
};

module.exports = function(sequelize, DataTypes)
{
  const User = sequelize.define('User', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    name : {
      field       : "name",
      type        : DataTypes.STRING(30),
      allowNull   : false,
      comment     : "Name of user"
    },

    facebookId : {
      field         : "facebook_id",
      type          : DataTypes.STRING(30),
      allowNull     : true,
      defaultValue  : null,
      comment       : "Facebook ID"
    },

    email : {
      field       : "email",
      type        : DataTypes.STRING(50),
      allowNull   : false,
      comment     : "Email of user",
      validate    : {
        isUnique: function (value, next)
        {
          const self = this;

          User.find({where: {email: value}})
            .then(function(user)
            {
              if(user && self.id !== user.id)
              {
                return next('Email is already in use');
              }

              return next();
          })
          .catch(function(err)
          {
              return next(err);
          });
        }
      }
    },

    salt: DataTypes.STRING,

    password: {
      field         : "password",
      type          : DataTypes.STRING(255),
      allowNull     : false,
      comment       : "User password"
    },

    gender : {
      field         : "gender",
      type          : DataTypes.ENUM('MALE','FEMALE'),
      allowNull     : true,
      defaultValue  : null,
      comment       : "User gender Male or Female"
    },

    role : {
      field         : "role",
      type          : DataTypes.ENUM('USER','ADMIN'),
      allowNull     : false,
      defaultValue  : 'USER',
      comment       : "User Role"
    },

    image: {
      field         : "image",
      type          : DataTypes.STRING(255),
      allowNull     : true,
      defaultValue  : null,
      comment       : "User image"
    },

    status : {
      field         : "status",
      type          : DataTypes.ENUM('ACTIVE','INACTIVE','DELETED'),
      allowNull     : false,
      defaultValue  : 'ACTIVE',
      comment       : "User is active, inactive or deleted"
    },

    createdBy : {
      field         : "created_by",
      type          : DataTypes.INTEGER(11),
      allowNull     : true,
      defaultValue  : null,
      comment       : "User ID who created this user"
    },

    updatedBy: {
      field         : "updated_by",
      type          : DataTypes.INTEGER(11),
      allowNull     : true,
      defaultValue  : null,
      comment       : "User ID who updated this user"
    }
  },
  {
    freezeTableName :true,
    tableName       :'users',

    // Pre-Save model hooks
    hooks: {
      beforeBulkCreate: function(users, fields, fn)
      {
        let totalUpdated = 0;

        users.forEach(function(user)
        {
          user.updatePassword(function(err)
          {
            if(err)
            {
              return fn(err);
            }

            totalUpdated += 1;

            if(totalUpdated === users.length)
            {
              return fn();
            }
          });
        });
      },

      beforeCreate: function(user, fields, fn)
      {
        user.updatePassword(fn);
      },

      beforeUpdate: function(user, fields, fn)
      {
        if (user.changed('password'))
        {
          return user.updatePassword(fn);
        }

        fn();
      }
    },

    /**
     * Instance Methods
     */
    instanceMethods: {
      /**
       * Authenticate - check if correct password provided
       *
       * @param {String} password
       * @param {Function} callback
       * @return {Boolean}
       * @api public
       */
      authenticate: function(password, callback)
      {
        if(!callback)
        {
          return this.password === this.encryptPassword(password);
        }

        const _this = this;

        this.encryptPassword(password, function(err, pwdGen)
        {
          if(err)
          {
            callback(err);
          }

          if (_this.password === pwdGen)
          {
            callback(null, true);
          }
          else
          {
            callback(null, false);
          }
        });
      },

      /**
       * Make salt
       *
       * @param {Number} byteSize Optional salt byte size, default to 16
       * @param {Function} callback
       * @return {String}
       * @api public
       */
      makeSalt: function(byteSize, callback)
      {
        var defaultByteSize = 16;

        if(typeof arguments[0] === 'function')
        {
          callback = arguments[0];
          byteSize = defaultByteSize;
        }
        else if(typeof arguments[1] === 'function')
        {
          callback = arguments[1];
        }

        if(!byteSize)
        {
          byteSize = defaultByteSize;
        }

        if(!callback)
        {
          return crypto.randomBytes(byteSize).toString('base64');
        }

        return crypto.randomBytes(byteSize, function(err, salt)
        {
          if(err)
          {
            callback(err);
          }
          return callback(null, salt.toString('base64'));
        });
      },

      /**
       * Encrypt password
       *
       * @param {String} password
       * @param {Function} callback
       * @return {String}
       * @api public
       */
      encryptPassword: function(password, callback)
      {
        if(!password || !this.salt)
        {
          if(!callback)
          {
            return null;
          }
          return callback(null);
        }

        const defaultIterations = 10000;
        const defaultKeyLength  = 64;
        const salt              = new Buffer(this.salt, 'base64');

        if(!callback)
        {
          return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
                       .toString('base64');
        }

        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength,
          function(err, key)
          {
            if(err)
            {
              callback(err);
            }

            return callback(null, key.toString('base64'));
          });
      },

      /**
       * Update password field
       *
       * @param {Function} fn
       * @return {String}
       * @api public
       */
      updatePassword: function(fn)
      {
        // Handle new/update passwords
        if (this.password)
        {
          if (!isValidLength(this.password) && authTypes.indexOf(this.provider) === -1)
          {
            fn(new Error('Invalid password'));
          }

          // Make salt with a callback
          const _this = this;

          this.makeSalt(function(saltErr, salt)
          {
            if(saltErr)
            {
              fn(saltErr);
            }

            _this.salt = salt;
            _this.encryptPassword(_this.password, function(encryptErr, hashedPassword)
            {
              if(encryptErr)
              {
                fn(encryptErr);
              }
              _this.password = hashedPassword;
              fn(null);
            });
          });
        }
        else
        {
          fn(null);
        }
      }
    },

    defaultScope: {
      where: {
        status: 'ACTIVE'
      }
    },

    classMethods : {
      associate:function(models)
      {
        User.belongsTo(models.User, {
          as: 'CreatedByUser',
          foreignKey: {
            name: 'created_by',
            allowNull: true
          }
        });
        
        User.belongsTo(models.User, {
          as: 'UpdatedByUser',
          foreignKey: {
            name: 'updated_by',
            allowNull: true
          }
        });

        User.hasMany(models.UserJackpot, {
          as: 'UserJackpots',
          foreignKey: {
            name: 'user_id',
            allowNull: false
          }
        });
      }
    }
  });

  return User;
};
