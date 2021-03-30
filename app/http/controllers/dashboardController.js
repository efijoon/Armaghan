const fs = require('fs');
const path = require('path');
const controller = require('./controller');
const Product = require('../../models/product');
const User = require('../../models/user');

class DashboardController extends controller {
    
    async index(req , res) {
        const lastProducts = await Product.find().populate({ path: 'category', select: 'name'}).limit(3).sort({ createdAt: '-1' });

        res.render('dashboard/dashboard', { layout: 'dashboard/master', lastProducts });
    }

    async userProfile(req , res) {
        res.render('dashboard/user-profile', { layout: 'dashboard/master' });
    }

    async updateProfile(req , res) {

        let { name, family, email, address, telephone } = req.body;

        if(! name || ! family || ! email || ! address || ! telephone) {
            return this.alertAndBack(req, res, {
              title: 'لطفا تمامی مقدارهای خواسته شده را وارد نمایید.',
              type: 'error',
              toast: true
            });
        }

        const user = await User.findById(req.user.id);

        user.name = name;
        user.family = family;
        user.email = email;
        user.telephone = telephone;
        user.address = address;
        await user.save();

        return this.alertAndBack(req, res, {
            title: 'اطلاعات حساب کاربری شما با موفقیت بروز شد',
            type: 'success',
            toast: true,
            position: 'center'
        })
    }

    async uploadProfileImage(req , res) {

        const user = await User.findById(req.user.id);

        if(req.user.image !== 'images/users/default.jpg') {
            fs.unlinkSync(path.resolve(__dirname, `../../../public/${user.image}`));
        }

        user.image = req.file.path.substr(7);
        await user.save();

        return this.alertAndBack(req, res, {
            title: 'عکس پروفایل با موفقیت بروز شد',
            type: 'success',
            toast: true,
            position: 'center'
        })
    }

}

module.exports = new DashboardController();