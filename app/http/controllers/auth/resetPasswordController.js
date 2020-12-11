const controller = require('app/http/controllers/controller');
const PasswordReset = require('app/models/password-reset');
const User = require('app/models/user');

class resetPasswordController extends controller {
    
    async showResetPassword(req , res) {

        let field = await PasswordReset.findOne({ $and : [ { email : req.query.e } , { token : req.params.token } ]});
        if(! field) {
            this.alert(req, {
                title: 'لینک شما برای تغییر رمز عبور استفاده شده و یا نامعتبر میباشد.',
                type: 'error',
                toast: true
            })
            return res.redirect('/auth/login');
        }  
        
        res.render('auth/reset' , { 
            title: 'ریست کردن رمزعبور حساب',
            token : req.params.token,
            userEmail: req.query.e, 
            layout: 'auth/reset'
        });
    }

    async resetPassword(req ,res) {

        if(req.body.pass !== req.body.confirmPass ) {
            return this.alertAndBack(req, res, {
                title: 'مقدار رمزعبور با تاییدیه آن تطابق ندارد.',
                type: 'error',
                toast: true
            });
        }

        let field = await PasswordReset.findOne({ $and : [ { email : req.body.email } , { token : req.body.token } ]});
        if(! field) {
            return this.alertAndBack(req, res, {
                title: "کاربری با چنین اطلاعاتی یافت نشد.",
                type: "error",
                toast: true
            });
        }

        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return this.alertAndBack(req, res, {
                title: "اپدیت شدن انجام نشد.",
                type: "error",
                toast: true
            });
        }

        user.$set({ password : user.hashPassword(req.body.pass) })
        await user.save();
        
        await field.remove();

        this.alert(req, {
          title: "رمزعبور شما با موفقیت تغییر یافت",
          type: "success",
          toast: true
        });

       return res.redirect('/auth/login');
    }

}

module.exports = new resetPasswordController();