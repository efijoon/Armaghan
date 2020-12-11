const controller = require('app/http/controllers/controller');
const UngivenOrder = require('../../../models/ungivenOrder');
const Product = require('../../../models/product');
const User = require('../../../models/user');
const GivenOrder = require('../../../models/givenOrder');

class ungivenOrderController extends controller {
    async index(req , res, next) {
        try {
            let page = req.query.page || 1;
            let ungivenOrders = await UngivenOrder.paginate({ sent: false } , { page , sort : { createdAt : 1 } , limit : 5,
                populate: { path: 'products.product', select: 'name' },
            });
            // return res.send(ungivenOrders)

            res.render('admin/ungivenOrder/index',  { title : 'سفارش های تحویل داده نشده' , ungivenOrders });
        } catch (err) {
            next(err);
        }
    }

    async create(req , res) {
        let products = await Product.find();
        
        res.render('admin/ungivenOrder/create', { products });        
    }

    async view(req , res) {
        this.isMongoId(req.params.id);
        let products = await Product.find();
        let ungivenOrder = await (await UngivenOrder.findById(req.params.id).populate({ path: 'products.product', select: 'name' }));

        if( ! ungivenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

        res.render('admin/ungivenOrder/view', { products, ungivenOrder });        
    }

    async store(req , res , next) {
        try {
        
            let { address, telephone, customer, products, productsCount } = req.body;

            let Orders = await UngivenOrder.find();
            let newUngivenOrder = new UngivenOrder({ 
                index: Orders.length + 1,
                address,
                telephone,
                customer
             });

            if(typeof(products) == 'object') {
                products.forEach((p, i) => {
                    newUngivenOrder.products.push({ product: p, count: productsCount[i] });
                });
            } else {
                newUngivenOrder.products.push({ product: products, count: productsCount });
            }

            await newUngivenOrder.save();

            return res.redirect('/admin/ungivenOrders');  
        } catch(err) {
            next(err);
        }
    }

    async edit(req, res ,next) {
        try {
            this.isMongoId(req.params.id);

            let ungivenOrder = await (await UngivenOrder.findById(req.params.id).populate({ path: 'products.product', select: 'name' }));
            let products = await Product.find();

            let productIDs = [];
            let productNames = [];
            let productCounts = [];
            ungivenOrder.products.forEach(p => {
                productIDs.push(p.product.id)
                productNames.push(p.product.name)
                productCounts.push(p.count)
            })
            let users = await User.find();

            if( ! ungivenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

            return res.render('admin/ungivenOrder/edit' , { products , ungivenOrder, users, productIDs, productNames, productCounts });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res , next) {
        try {
            let { address, telephone, customer, products, productsCount } = req.body;
            
            let ungivenOrder = await UngivenOrder.findById(req.params.id);
            ungivenOrder.products = [];

            if(typeof(products) == 'object') {
                products.forEach((p, i) => {
                    ungivenOrder.products.push({ product: p, count: productsCount[i] });
                });
            } else {
                ungivenOrder.products.push({ product: products, count: productsCount });
            }

            ungivenOrder.address = address;
            ungivenOrder.telephone = telephone;
            ungivenOrder.customer = customer;

            await ungivenOrder.save();

            return res.redirect('/admin/ungivenOrders');
        } catch(err) {
            next(err);
        }
    }

    async destroy(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            let ungivenOrder = await UngivenOrder.findById(req.params.id);
            if( ! ungivenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

            // delete ungivenOrder
            ungivenOrder.remove();

            return res.redirect('/admin/ungivenOrders');
        } catch (err) {
            next(err);
        }
    }

    async completeOrder(req , res , next) {
        try {
            this.isMongoId(req.params.id);

            let ungivenOrder = await UngivenOrder.findById(req.params.id);
            if( ! ungivenOrder ) this.error('چنین سفارشی وجود ندارد' , 404);

            let orders = await GivenOrder.find();
            let newGivenOrder = new GivenOrder({
                index: orders.length + 1,
                address: ungivenOrder.address,
                telephone: ungivenOrder.telephone,
                customer: ungivenOrder.customer,
                products: ungivenOrder.products
            })

            await newGivenOrder.save();
            await ungivenOrder.remove();

            return res.redirect('/admin/ungivenOrders');
        } catch (err) {
            next(err);
        }
    }

}

module.exports = new ungivenOrderController();