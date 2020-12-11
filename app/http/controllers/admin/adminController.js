const controller = require('app/http/controllers/controller');
const Product = require('../../../models/product');

class AdminController extends controller {

    async index(req , res) {
        let products = await Product.find().populate('category');


        res.render('admin/index', { products });
    }

}

module.exports = new AdminController();