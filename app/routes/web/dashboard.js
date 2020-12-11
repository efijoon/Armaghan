const express = require('express');

const router = express.Router();

// Controllers
const dashboardController = require('app/http/controllers/dashboardController');

// middlewares
const redirectIfNotAuthenticated = require('app/http/middleware/redirectIfNotAuthenticated');

// Uploader
const upload = require('app/helpers/uploadImage');

router.get('/dashboard', dashboardController.index);
router.get('/user-profile', redirectIfNotAuthenticated.handle, dashboardController.userProfile);
router.post('/updateProfile', redirectIfNotAuthenticated.handle, dashboardController.updateProfile);


module.exports = router;