const controller = require("app/http/controllers/controller");
const passport = require("passport");

class loginController extends controller {
  showLoginForm(req, res) {
    res.render("auth/login", { title: "صفحه ورود", layout: "auth/login" });
  }

  async login(req, res, next) {
    let { email, password } = req.body;

    if (email == "" || password == "") {
      return this.alertAndBack(req, res, {
        title: "لطفا تمامی مقدارهای خواسته شده را وارد نمایید.",
        type: "error",
        toast: true,
      });
    }

    if (!this.emailValidator(email)) {
      return this.alertAndBack(req, res, {
        position: "center",
        type: "error",
        title: "لطفا یک ایمیل معتبر را وارد کنید.",
        showConfirmButton: false,
        toast: true,
        timer: 4000,
      });
    }

    passport.authenticate("local.login", async (err, user) => {
      if (!user) {
        return this.alertAndBack(req, res, {
          title: "اطلاعات وارد شده مطابقت ندارد.",
          type: "error",
          toast: true,
        });
      }

      req.logIn(user, (err) => {
        if (req.body.remember) user.setRememberToken(res);

        return res.redirect("/dashboard/dashboard");
      });

      // res.send('Done !')
    })(req, res, next);
  }
}

module.exports = new loginController();
