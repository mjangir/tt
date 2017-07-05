'use strict';

import { User, Jackpot } from '../sqldb';

// Seed User Table

User.sync({force: true})
.then(function()
{
  return User.destroy({ where: {} });
})
.then(function() {
  User.bulkCreate([{
    name: 'Test User',
    email: 'test@example.com',
    password: 'test'
  },
  {
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }])
  .then(function(data)
  {
    Jackpot.sync({force: true})
    .then(function()
    {
      return Jackpot.destroy({ where: {} });
    }).then(function()
    {
      Jackpot.bulkCreate([{
        title                 : 'Jackpot 1',
        amount                : '20000',
        gameClockTime         : '300',
        doomsDayTime          : '3600',
        gameClockRemaining    : '300',
        doomsDayRemaining     : '3600',
        gameStatus            : 'NOT_STARTED',
        created_by            : 1,
        updated_by            : 1,
      },
      {
        title                 : 'Jackpot 2',
        amount                : '50000',
        gameClockTime         : '600',
        doomsDayTime          : '7200',
        gameClockRemaining    : '600',
        doomsDayRemaining     : '7200',
        gameStatus            : 'NOT_STARTED',
        created_by            : 1,
        updated_by            : 1,
      }]);
    });
    return true;
  });
});
