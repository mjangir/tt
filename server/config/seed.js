'use strict';

import { User } from '../sqldb';

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
    .then(function()
    {
      console.log('finished populating users');
    });
  });
