'use strict';

import express from 'express';
import controller from './settings.controller';
import * as validators from './settings.validations';
import auth from '../../auth/auth.service';

// Create router object
const router = express.Router();

// Get all settingss
router.get('/', [auth.isAuthenticated(), validators.index], controller.index);

// Get a single settings
router.get('/:id', [auth.isAuthenticated(), validators.show], controller.show);

// Create a new settings
router.post('/', [auth.isAuthenticated(), validators.createOrUpdate], controller.create);

// Update a settings using PUT
router.put('/:id', [auth.isAuthenticated(), validators.createOrUpdate], controller.update);

// Update a settings using PATCH
router.patch('/:id', [auth.isAuthenticated(), validators.createOrUpdate], controller.update);

// Delete a settings
router.delete('/:id', [auth.isAuthenticated(), validators.destroy], controller.destroy);

//Export the router
module.exports = router;
