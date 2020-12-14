const express = require('express');
const router = express.Router();

// Controllers
const productController = require('app/http/controllers/productController');

// middlewares
const redirectIfNotAuthenticated = require('app/http/middleware/redirectIfNotAuthenticated');

router.get('/product', productController.showInfoProductPage);
router.get('/addToCart/:id', productController.addToCart);
router.get('/addToFavourite/:id', redirectIfNotAuthenticated.handle, productController.addToFavourite);
router.get('/removeFromCart/:id', productController.removeFromCart);
router.get('/removeFromFavourite/:id', redirectIfNotAuthenticated.handle, productController.removeFromFavourite);

router.get('/favouriteProducts/:id', redirectIfNotAuthenticated.handle, productController.favouriteProducts);
router.get('/boughtProducts/:id', redirectIfNotAuthenticated.handle, productController.boughtProducts);

router.get('/purchaseCart', productController.purchaseCart);
router.get('/completePurchase', productController.completePurchase);
router.get('/dashboard/cart', redirectIfNotAuthenticated.handle, productController.showUserCartPage);
router.get('/increaseCountInCart/:id', productController.increaseCountInCart);
router.get('/decreaseCountInCart/:id', productController.decreaseCountInCart);

router.post('/searchProduct', redirectIfNotAuthenticated.handle, productController.searchInProduct);

router.get('/buyInformation', productController.buyInformation);
router.get('/completeSendInfo/:userID', redirectIfNotAuthenticated.handle, productController.completeSendInfo);
router.get('/products/payment/checker', productController.checker);
router.post('/products/payment', productController.payment);

router.post('/comment', redirectIfNotAuthenticated.handle, productController.comment);

module.exports = router;