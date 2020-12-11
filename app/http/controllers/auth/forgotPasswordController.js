const controller = require('app/http/controllers/controller');
const PasswordReset = require('app/models/password-reset');
const User = require('app/models/user');
const uniqueString = require('unique-string')
const mail = require('app/helpers/mail');

class forgotPasswordController extends controller {
    
    showForgotPassword(req , res) {
        res.render('auth/fg' , { title: 'فراموشی رمز عبور', layout: 'auth/fg' });
    }

    async sendResetLink(req ,res , next) {
        let user = await User.findOne({ email : req.body.email });
        if(! user) {
            return this.alertAndBack(req, res, {
                title: 'چنین کاربری با این ایمیل در سایت موجود نمیباشد.',
                type: 'error',
                toast: true
            })
        }

        let field = await PasswordReset.findOne({ email: req.body.email });
        if(field) {
            return this.alertAndBack(req, res, {
                title: 'لینک بازیابی رمز عبور قبلا برای ایمیل شما ارسال شده است.',
                type: 'info',
                toast: true
            })
        }

        const newPasswordReset = new PasswordReset({
            email : req.body.email,
            token : uniqueString()
        });
        await newPasswordReset.save();

        let mailOptions = {
            from: '"سایت چت باز', // sender address
            to: `${req.body.email}`, // list of receivers
            subject: 'ریست کردن پسورد', // Subject line
            html: `
                <h2>ریست کردن پسورد</h2>
                <h3><p>برای ریست کردن پسورد بر روی لینک زیر کلیک کنید</p></h3>
                <h1><a href="${config.siteurl}/auth/password/reset/${newPasswordReset.token}?e=${req.body.email}">ریست کردن</a></h1>
            ` // html body
        };

        mail.sendMail(mailOptions  , (err , info) => {
            if(err) return console.log(err);

            console.log('Message Sent : ');

            this.alert(req, {
                title : 'ایمیل حاوی لینک پسورد به ایمیل شما ارسال شد.',
                type  : 'info',
                toast: true
            });

            return res.redirect('/auth/login');

        })
    }

}

module.exports = new forgotPasswordController();