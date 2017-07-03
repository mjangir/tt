'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app)
{
  app.use('/api/users', require('./api/user'));
  app.use('/api/me', require('./api/me'));
  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth)/*')
   .get(errors[404]);
};
