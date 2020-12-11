const controller = require('app/http/controllers/controller');
const Product = require('../../../models/product');
const Category = require('../../../models/category');
const fs = require('fs');

class courseController extends controller {
    async index(req , res, next) {
        try {
            let page = req.query.page || 1;
            let products = await Product.paginate({} , { page , sort : { createdAt : '-1' } , limit : 15 });

            res.render('admin/products/index',  { title : 'محصولات' , products });
        } catch (err) {
            next(err);
        }
    }

    async create(req , res) {
        let categories = await Category.find({}).populate('parent');

        // return res.send(categories[1].parent.name)

        res.render('admin/products/create' , { categories });        
    }

    async store(req , res , next) {
        try {
            
            await this.validator(req, res);

            let { name, desc, price, count, category } = req.body;

            // create product
            if(! req.file) {
                return this.alertAndBack(req, res, {
                    title: 'لطفا عکسی را برای محصول انتخاب نمایید.',
                    type: 'error',
                    toast: true,
                    position: 'center'
                })
            }

            let newProduct = new Product({
                user : req.user._id,
                name,
                desc,
                category,
                price,
                count,
                image: req.file.path.substr(7),
            });

            if(count > 0) newProduct.awailable = true;
                else newProduct.awailable = false;

            await newProduct.save();

            this.sendNotificationEmailToSubscribers(req, res, next, newProduct.id);

            return res.redirect('/admin/products');  
        } catch(err) {
            next(err);
        }
    }

    async edit(req, res ,next) {
        try {
            this.isMongoId(req.params.id);

            let product = await Product.findById(req.params.id);
            if( ! product ) this.error('چنین محصولی ای وجود ندارد' , 404);

            let categories = await Category.find({}).populate('parent');
            return res.render('admin/products/edit' , { product , categories });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res , next) {
        try {

            await this.isMongoId(req.params.id);
            
            await this.validator(req, res);

            let product = await Product.findById(req.params.id);

            let objForUpdate = {};

            if(req.file) fs.unlinkSync(`./public/${product.image}`);

            // check image 
            if(req.file) objForUpdate.image = req.file.path.substr(7);

            delete req.body.image;

            if(req.body.count > 0) objForUpdate.awailable = true;
                else objForUpdate.awailable = false;

            objForUpdate.category = req.body.category;
            
            await Product.findByIdAndUpdate(req.params.id , { $set : { ...req.body , ...objForUpdate }})
            return res.redirect('/admin/products');
        } catch(err) {
            next(err);
        }
    }

    async destroy(req , res  , next) {
        try {
            this.isMongoId(req.params.id);

            let product = await Product.findById(req.params.id);
            if( ! product ) this.error('چنین محصولی ای وجود ندارد' , 404);
            
            // delete Image
            fs.unlinkSync(`./public/${product.image}`);

            // delete products
            product.remove();

            return res.redirect('/admin/products');
        } catch (err) {
            next(err);
        }
    }

    async validator(req, res) {
        let { name, desc, price, count } = req.body;
            
        if(name == '' || price == '' || desc == '' || count == '') {
            return this.alertAndBack(req, res, {
                title: 'لطفا  تمامی مقادیر خواسته شده را وارد نمایید.',
                type: 'error',
                toast: true,
                position: 'center'
            })
        }
        
        let e = /^[0-9]+$/;
        if(! e.test(count) || ! e.test(price)) {
            return this.alertAndBack(req, res, {
                title: 'تعداد محصول موجود در انبار یا قیمت محصول باید یک عدد باشد.',
                type: 'error',
                toast: true,
                position: 'center'
            })
        }

        if(desc.length < 20) {
            return this.alertAndBack(req, res, {
                title: 'متن توضیحات محصول نمیتواند کمتر از 10 کارکتر باشد.',
                type: 'error',
                toast: true,
                position: 'center'
            })
        }
    }
}

module.exports = new courseController();