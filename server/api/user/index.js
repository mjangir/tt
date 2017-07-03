'use strict';

import express from 'express';
import controller from './user.controller';
import * as validators from './user.validations';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/', [auth.isAuthenticated(), validators.index], controller.index);

router.delete('/:id', [auth.isAuthenticated(), validators.destroy], controller.destroy);

router.put('/change-my-password', [auth.isAuthenticated()], controller.changePassword);

router.get('/:id', [auth.isAuthenticated(), validators.show], controller.show);

router.post('/', [auth.isAuthenticated(), validators.createOrUpdate], controller.create);

export default router;
