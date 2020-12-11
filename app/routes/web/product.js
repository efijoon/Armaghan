const express = require('express');
const router = express.Router();

// Controllers
const productController = require('app/http/controllers/productController');

// middlewares
const redirectIfNotAuthenticated = require('app/http/middleware/redirectIfNotAuthenticated');

router.get('/product', productController.showInfoProductPage);
router.get('/addToCart/:id', redirectIfNotAuthenticated.handle, productController.addToCart);
router.get('/addToFavourite/:id', redirectIfNotAuthenticated.handle, productController.addToFavourite);
router.get('/removeFromCart/:id', redirectIfNotAuthenticated.handle, productController.removeFromCart);
router.get('/removeFromFavourite/:id', redirectIfNotAuthenticated.handle, productController.removeFromFavourite);

router.get('/favouriteProducts/:id', redirectIfNotAuthenticated.handle, productController.favouriteProducts);
router.get('/boughtProducts/:id', redirectIfNotAuthenticated.handle, productController.boughtProducts);

router.get('/dashboard/cart', redirectIfNotAuthenticated.handle, productController.showUserCartPage);
router.get('/increaseCountInCart/:id', redirectIfNotAuthenticated.handle, productController.increaseCountInCart);
router.get('/decreaseCountInCart/:id', redirectIfNotAuthenticated.handle, productController.decreaseCountInCart);

router.post('/searchProduct', redirectIfNotAuthenticated.handle, productController.searchInProduct);

router.get('/completeSendInfo/:userID', redirectIfNotAuthenticated.handle, productController.completeSendInfo);
router.get('/products/payment/checker', redirectIfNotAuthenticated.handle, productController.checker);
router.post('/products/payment', redirectIfNotAuthenticated.handle, productController.payment);

router.post('/comment', redirectIfNotAuthenticated.handle, productController.comment);

module.exports = router;