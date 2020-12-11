const express = require('express');
const router = express.Router();

// Controllers
const homeController = require('app/http/controllers/homeController');
const productController = require('app/http/controllers/productController');
const dashboardController = require('app/http/controllers/dashboardController');
const subscriberController = require('app/http/controllers/admin/subscriberController');

// middlewares
const redirectIfNotAuthenticated = require('app/http/middleware/redirectIfNotAuthenticated');

router.get('/logout' , (req ,res) => {
    res.clearCookie('remember_token');
    req.logout();
    res.redirect('/');
});

// Uploader
const upload = require('app/helpers/uploadImage');

// Home Routes
router.get('/' , homeController.index);
router.get('/products' , productController.index);
router.post('/uploadProfileImage', redirectIfNotAuthenticated.handle, upload.single('image-uploader'), dashboardController.uploadProfileImage);

// It has a reson that this rout getter is here (go to admin router for reason !)
router.post('/addSubscriber' , subscriberController.addSubscriber);

router.get('/testWorks' , homeController.test);

module.exports = router;