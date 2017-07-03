'use strict';

import express from 'express';
import controller from './me.controller';
import * as validators from './me.validations';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/profile', [auth.isAuthenticated(), validators.index], controller.index);

router.put('/profile', [auth.isAuthenticated(), validators.update], controller.update);

router.put('/change-password', [auth.isAuthenticated(), validators.changePassword], controller.changePassword);

router.get('/statistics', [auth.isAuthenticated(), validators.statistics], controller.statistics);

export default router;
