const controller = require('app/http/controllers/controller');
const UngivenOrder = require('../../../models/ungivenOrder');
const Product = require('../../../models/product');
const User = require('../../../models/user');
const GivenOrder = require('../../../models/givenOrder');

class GivenOrderController extends controller {
    async index(req , res, next) {
        try {
            let page = req.query.page || 1;
            let givenOrders = await GivenOrder.paginate({ sent: true } , { page , sort : { createdAt : 1 } , limit : 5,
                populate: [{ path: 'products.product', select: 'name' }, { path: 'customer', select: 'name family' }],
            });

            res.render('admin/givenOrder/index',  { title : 'سفارش های تحویل داده شده' , givenOrders });
        } catch (err) {
            next(err);
        }
    }

    async create(req , res) {
        let products = await Product.find();
        
        res.render('admin/givenOrder/create', { products });        
    }

    async view(req , res) {
        this.isMongoId(req.params.id);
        let products = await Product.find();
        let givenOrder = await (await GivenOrder.findById(req.params.id).populate([{ path: 'products.product', select: 'name' }, { path: 'customer', select: 'name family' }]));

        if( ! givenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

        res.render('admin/givenOrder/view', { products, givenOrder });        
    }

    async store(req , res , next) {
        try {
            let { address, telephone, customer, products, productsCount } = req.body;

            let Orders = await GivenOrder.find();
            let newGivenOrder = new GivenOrder({ 
                index: Orders.length + 1,
                address,
                telephone,
                customer
             });

            if(typeof(products) == 'object') {
                products.forEach((p, i) => {
                    newGivenOrder.products.push({ product: p, count: productsCount[i] });
                });
            } else {
                newGivenOrder.products.push({ product: products, count: productsCount });
            }

            await newGivenOrder.save();

            return res.redirect('/admin/ungivenOrders');  
        } catch(err) {
            next(err);
        }
    }

    async edit(req, res ,next) {
        try {
            if(! this.isMongoId(req.params.id)) return;

            let givenOrder = await (await GivenOrder.findById(req.params.id).populate([{ path: 'products.product', select: 'name' }, { path: 'customer', select: 'name family' }]));
            let products = await Product.find();

            let productIDs = [];
            let productNames = [];
            let productCounts = [];
            givenOrder.products.forEach(p => {
                productIDs.push(p.product.id)
                productNames.push(p.product.name)
                productCounts.push(p.count)
            })
            let users = await User.find();

            if( ! givenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

            return res.render('admin/givenOrder/edit' , { products , givenOrder, users, productIDs, productNames, productCounts });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res , next) {
        try {
            let { address, telephone, customer, products, productsCount } = req.body;
            
            let givenOrder = await GivenOrder.findById(req.params.id);
            givenOrder.products = [];

            if(typeof(products) == 'object') {
                products.forEach((p, i) => {
                    givenOrder.products.push({ product: p, count: productsCount[i] });
                });
            } else {
                givenOrder.products.push({ product: products, count: productsCount });
            }

            givenOrder.address = address;
            givenOrder.telephone = telephone;
            givenOrder.customer = customer;

            await givenOrder.save();

            return res.redirect('/admin/givenOrders');
        } catch(err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            let givenOrder = await GivenOrder.findById(req.params.id);
            if( ! givenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

            // delete givenOrder
            givenOrder.remove();

            return res.redirect('/admin/givenOrders');
        } catch (err) {
            next(err);
        }
    }

    async uncompleteOrder(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            let givenOrder = await GivenOrder.findById(req.params.id);
            if( ! givenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

            const user = await User.findById(givenOrder.customer);
            let orders = await UngivenOrder.find();

            let newUngivenOrder = new UngivenOrder({
                index: orders.length + 1,
                address: givenOrder.address,
                telephone: givenOrder.telephone,
                customer: givenOrder.customer,
                products: givenOrder.products
            })

            const givenOrderProductIds = [];
            givenOrder.products.forEach(product => {
                givenOrderProductIds.push(`${product.product}`);
            });

            user.products.forEach(product => {
                if(givenOrderProductIds.includes(`${product.productId}`)) product.status = 'ungiven';
            });

            await user.save();
            await newUngivenOrder.save();
            await givenOrder.remove();

            return res.redirect('/admin/givenOrders');
        } catch (err) {
            next(err);
        }
    }

}

module.exports = new GivenOrderController();