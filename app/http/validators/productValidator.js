const validator = require('./validator');
const { check } = require('express-validator/check');
const Product = require('../../models/product');
const path = require('path');

class productValidator extends validator {
    
    handle() {
        return [
            check('name')
                .isLength({ min : 5 })
                .withMessage('عنوان نمیتواند کمتر از 5 کاراکتر باشد')
                .custom(async (value , { req }) => {
                    if(req.query._method === 'put') {
                        let product = await Product.findById(req.params.id);
                        if(product.name === value) return;
                    }
                    let product = await Product.findOne({ name: value });
                    if(product) {
                        throw new Error('چنین محصولی ای با این عنوان قبلا در سایت قرار داد شده است')
                    }
                }),

            check('image')
                .custom(async (value , { req }) => {
                    if(req.query._method === 'put' && value === undefined) return;

                    if(! value)
                        throw new Error('وارد کردن تصویر الزامی است');

                    let fileExt = ['.png' , '.jpg' , '.jpeg' , '.svg'];
                    if(! fileExt.includes(path.extname(value)))
                        throw new Error('پسوند فایل وارد شده از پسوندهای تصاویر نیست')
                }),

            check('desc')
                .isLength({ min : 20 })
                .withMessage('متن دوره نمیتواند کمتر از 20 کاراکتر باشد'),

            check('price')
                .not().isEmpty()
                .withMessage('قیمت دوره نمیتواند خالی بماند'),
        ]
    }

    
    slug(title) {
        return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g , "-")
    }
}

module.exports = new productValidator();