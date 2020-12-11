const controller = require('./controller');
const Product = require('../../models/product');
const Payment = require('../../models/payment');
const User = require('../../models/user');
const UngivenOrder = require('../../models/ungivenOrder');

class HomeController extends controller {
    
    async index(req , res) {
        let products = await Product.find().populate('category');


        res.render('home/index', { products });
    }

    async test(req , res) {
        let payment = await Payment.findOne({ resnumber : 'A00000000000000000000000000224408214' });
        let user = await User.findById(req.user.id);

        payment.set({ payment : true });

        user.points += 10;
        user.cart = [];

        let ungivenOrders = await UngivenOrder.find();
        const newUngivenOrder = await UngivenOrder({
            index: ungivenOrders.length + 1,
            address: payment.address,
            telephone: payment.telephone,
            customer: `${req.user.name} ${req.user.family}`
        })

        let thep;
        let userBoughtProductsID = [];

        user.products.forEach(product => {
            userBoughtProductsID.push(`${product.id}`);
        })

        payment.products.forEach(async p => {
            
            if(userBoughtProductsID.indexOf(p.id) == -1) {
                // User hadn't baught this product yet
                user.products.push({ id: p.id, count: p.count });
            } else {
                // User had baught this product in past
                user.products.forEach(baughtProduct => {
                    if(baughtProduct.id == p.id) baughtProduct.count += p.count;
                })
            }
            newUngivenOrder.products.push({ product: p.id, count: p.count });

            thep = await Product.findById(p.id);
            thep.count -= p.count;
            await thep.save();
        });

        await newUngivenOrder.save();
        await payment.save();
        await user.save();

        this.alert(req , {
            title : 'با تشکر',
            message : 'عملیات مورد نظر با موفقیت انجام شد',
            type : 'success',
            button : 'بسیار خوب'
        })

        res.redirect('/dashboard/dashboard');
    }
}

module.exports = new HomeController();