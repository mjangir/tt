'use strict';

import express from 'express';
import controller from './jackpot.controller';
import * as validators from './jackpot.validations';
import auth from '../../auth/auth.service';

// Create router object
const router = express.Router();

// Get all jackpots
router.get('/', [auth.isAuthenticated(), validators.index], controller.index);

// Get a single jackpot
router.get('/:id', [auth.isAuthenticated(), validators.show], controller.show);

// Create a new jackpot
router.post('/', [auth.isAuthenticated(), validators.createOrUpdate], controller.create);

// Update a jackpot using PUT
router.put('/:id', [auth.isAuthenticated(), validators.createOrUpdate], controller.update);

// Update a jackpot using PATCH
router.patch('/:id', [auth.isAuthenticated(), validators.createOrUpdate], controller.update);

// Delete a jackpot
router.delete('/:id', [auth.isAuthenticated(), validators.destroy], controller.destroy);

//Export the router
module.exports = router;
