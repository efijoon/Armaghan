const controller = require('app/http/controllers/controller');
const Product = require('../../../models/product');
const Category = require('../../../models/category');
const fs = require('fs');
const User = require('../../../models/user');
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
            if(! await this.validator(req, res)) return;
            
            const { name, desc, price, count, category } = req.body;
            const { image, images } = req.files;
            
            const imagesPaths = [];
            if(images.length > 0) {
                images.forEach(image => {
                    imagesPaths.push(image.path.substr(7));
                });
            }
            
            const newProduct = new Product({
                user : req.user._id,
                name, desc, category, price, count,
                image: image[0].path.substr(7),
                awailable: count > 0 ? true : false,
                images: imagesPaths
            });
            await newProduct.save();

            // this.sendNotificationEmailToSubscribers(req, res, next, newProduct.id);

            this.alert(req, {
                title: 'کالا با موفقیت به محصولات فروشگاه اضافه شد.',
                type: 'success',
                toast: true,
                position: 'center'
            })
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
            const { id } = req.params;
            this.isMongoId(id);
            
            let product = await Product.findById(req.params.id);
            if( ! product ) this.error('چنین محصولی ای وجود ندارد' , 404);
            
            // delete Images
            if(product.images.length > 0) {
                product.images.forEach(image => {
                    fs.unlinkSync(`./public/${image}`);
                });
            }

            (await User.find()).forEach(async (user, index) => {
                user.cart = user.cart.filter(item => `${item.id}` !== `${id}`);
                user.favourite = user.favourite.filter(item => `${item.id}` !== `${id}`);

                await user.save()
            });

            // delete products
            product.remove();

            return res.redirect('/admin/products');
        } catch (err) {
            next(err);
        }
    }

    async validator(req, res) {
        let { name, desc, price, count } = req.body;

        if(req.files.image.length < 1) {
            return this.alertAndBack(req, res, {
                title: 'لطفا عکس اصلی محصول را وارد نمایید.',
                type: 'error',
                toast: true,
                position: 'center'
            })
        }
            
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

        return true;
    }
}

module.exports = new courseController();