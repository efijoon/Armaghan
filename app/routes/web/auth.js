const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controllers
const loginController = require('app/http/controllers/auth/loginController');
const registerController = require('app/http/controllers/auth/registerController');
const forgotPasswordController = require('app/http/controllers/auth/forgotPasswordController');
const resetPasswordController = require('app/http/controllers/auth/resetPasswordController');

// Home Routes
router.get('/login' , loginController.showLoginForm);
router.post('/login' , loginController.login);

router.get('/register' , registerController.showRegsitrationForm);
router.post('/register' , registerController.register); 

router.get('/password/sendRecoveryEmail' , forgotPasswordController.showForgotPassword);
router.post('/password/sendRecoveryEmail' , forgotPasswordController.sendResetLink);

router.get('/password/reset/:token' , resetPasswordController.showResetPassword);
router.post('/password/reset/:token' , resetPasswordController.resetPassword);

router.get('/google' , passport.authenticate('google' , { scope : ['profile' , 'email'] }));
router.get('/google/callback' , passport.authenticate('google' , { successRedirect : '/' , failureRedirect : '/register' }) )

module.exports = router;