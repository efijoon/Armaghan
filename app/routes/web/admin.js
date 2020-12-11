const express = require('express');
const router = express.Router();

// Controllers
const adminController = require('app/http/controllers/admin/adminController');
const productController = require('app/http/controllers/admin/productController');
const commentController = require('app/http/controllers/admin/commentController');
const categoryController = require('app/http/controllers/admin/categoryController');
const userController = require('app/http/controllers/admin/userController');
const ungivenOrderController = require('app/http/controllers/admin/ungivenOrderController');
const givenOrderController = require('app/http/controllers/admin/givenOrderController');
const subscriberController = require('app/http/controllers/admin/subscriberController');

// Helpers
const upload = require('app/helpers/uploadProductImage');

// Middlewares
const convertFileToField = require('app/http/middleware/convertFileToField')
const redirectIfNotAdmin = require('app/http/middleware/redirectIfNotAdmin')

router.use((req , res , next) => {
    res.locals.layout = "admin/master";
    next();
})

// Admin Routes
router.get('/' , adminController.index);

// Course Routes
router.get('/products' , productController.index);
router.get('/products/create', productController.create);
router.post('/products/create',
    upload.single('image'),
    convertFileToField.handle,
    productController.store
);
router.get('/products/:id/edit', productController.edit);
router.put('/products/:id',
    upload.single('image') ,
    convertFileToField.handle,  
    productController.update
);
router.delete('/products/:id' , productController.destroy);

router.get('/users' , userController.index);
router.get('/users/create' , userController.create);
router.post('/users' , userController.store);
router.post('/users/:id' , userController.update);
router.delete('/users/:id' , userController.destroy);
router.get('/users/:id' , userController.edit);
router.get('/users/:id/toggleadmin' , userController.toggleadmin);;

// Category Routes
router.get('/categories' , categoryController.index);
router.get('/categories/create' , categoryController.create);
router.post('/categories/create' , categoryController.store );
router.get('/categories/:id/edit' , categoryController.edit);
router.put('/categories/:id' , categoryController.update );
router.delete('/categories/:id' , categoryController.destroy);

// UngivenOreder Routes
router.get('/ungivenOrders' , ungivenOrderController.index);
router.get('/ungivenOrders/create' , ungivenOrderController.create);
router.post('/ungivenOrders/create' , ungivenOrderController.store );
router.get('/ungivenOrders/:id/edit' , ungivenOrderController.edit);
router.get('/ungivenOrders/:id/view' , ungivenOrderController.view);
router.put('/ungivenOrders/:id' , ungivenOrderController.update );
router.get('/completeOrder/:id' , ungivenOrderController.completeOrder );
router.delete('/ungivenOrders/:id' , ungivenOrderController.destroy);

// givenOreder Routes
router.get('/givenOrders' , givenOrderController.index);
router.get('/givenOrders/create', givenOrderController.create);
router.post('/givenOrders/create' , givenOrderController.store);
router.get('/givenOrders/:id/edit' , givenOrderController.edit);
router.get('/givenOrders/:id/view' , givenOrderController.view);
router.put('/givenOrders/:id' , givenOrderController.update);
router.get('/uncompleteOrder/:id' , givenOrderController.uncompleteOrder );
router.delete('/givenOrders/:id' , givenOrderController.destroy);

// Comment Routes
router.get('/comments/approved' , commentController.approved);
router.get('/comments' , commentController.index);
router.put('/comments/:id/approved' , commentController.update );
router.delete('/comments/:id' , commentController.destroy);

// Comment Routes
router.get('/subscribers' , subscriberController.index);
// The addSubscriber func is in the home router because if the route would be her and the user is not admin, so user cant be a subscriber 
router.delete('/subscribers/:id' , subscriberController.removeSubscriber);

// router.post('/upload-image' , upload.single('upload') , adminController.uploadImage);
module.exports = router;