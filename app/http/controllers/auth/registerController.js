const controller = require("app/http/controllers/controller");
const passport = require("passport");

class registerController extends controller {
  showRegsitrationForm(req, res) {
    res.render("auth/register", { layout: "auth/register" });
  }

  async register(req, res, next) {

    let { name, family, email, password, confirmPassword } = req.body;

    if(name == '' || family == '' || email == '' || password == '' || confirmPassword == ''  ) {
      return this.alertAndBack(req, res, {
        title: 'لطفا تمامی مقدارهای خواسته شده را وارد نمایید.',
        type: 'error',
        toast: true
      });
    }

    if(password !== confirmPassword ) {
      return this.alertAndBack(req, res, {
        title: 'مقدار رمزعبور با تاییدیه آن تطابق ندارد.',
        type: 'error',
        toast: true
      });
    }

    this.emailValidator(req, res, email);

    passport.authenticate("local.register", async (err, newUser) => {

        if (! newUser) {
          return this.alertAndBack(req, res, {
              title: 'چنین کاربری با این ایمیل در فروشگاه عضو میباشد.',
              type: 'error',
              toast: true
          });
        }

        this.alert(req, {
            title: 'شما هم اکنون در سایت عضو هستید و میتوانید به حساب کاربری خود وارد شوید ...',
            type: 'success',
            toast: true
        });
        res.redirect('/auth/login');

      })(req, res, next);
  }
}

module.exports = new registerController();
