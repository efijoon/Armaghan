const autoBind = require('auto-bind');
const isMongoId = require('validator/lib/isMongoId');
const mail = require("app/helpers/mail");
const { validationResult } = require('express-validator/check');
const Subscriber = require('../../models/subscriber');

module.exports = class controller {
  constructor() {
    autoBind(this);
  }

  back(req, res) {
    req.flash("formData", req.body);
    return res.redirect(req.header("Referer") || "/");
  }

  isMongoId(paramId) {
    if(! paramId) return false;
    if (!isMongoId(paramId)) return false;

    return true;
    // this.error("ای دی وارد شده صحیح نیست", 404);
  }

  error(message, status = 500) {
    let err = new Error(message);
    err.status = status;
    throw err;
  }

  slug(title) {
    return title.replace(/([^۰-۹آ-یa-z0-9]|-)+/g, "-");
  }

  alert(req, data) {
    let title = data.title || "",
      message = data.message || "",
      type = data.type || "info",
      button = data.button || null,
      timer = data.timer || 6000,
      toast = data.toast || false,
      position = data.position || 'center';

    req.flash("SAmessages", { title, message, type, button, timer, toast, position });
  }

  async alertAndBack(req, res, data) {
    await this.alert(req, data);
    return this.back(req, res);
  }

  async sendNotificationEmailToSubscribers(req, res, next, productID) {
    try {
      let subscribers = await Subscriber.find();
      subscribers.forEach(sub => {
        let mailOptions = {
          from: '"فروشگاه اینترنتی ارمغان', // sender address
          to: sub.email, // list of receivers
          subject: "اضافه شدن کالای جدید به فروشگاه", // Subject line
          html: `
            <div class="col" style="text-align: center;">
              <p style="font-family: Vazir;font-size: 20px;font-weight: 700;">سلام، براتون یه سوپرایز داریم. کالای جدیدی به فروشگاه ارمغان اضافه شده که شما از الان میتونید با مراجعه به وبسایت فروشگاه اطلاعات اون رو مشاهده کنید و اگر که پسندید، قابل خریداری هم هست! منتظر شما هستیم</p>
              <h1 style="padding: 20px;border: 5px solid red;border-radius: 15px;">برای مشاهده محصول بر روی <a style="font-family: Vazir;font-weight: 700;color: purple;" href="${config.siteurl}/product?pi=${productID}"> لینک محصول </a> کلیک کنید</h1>
            </div>
          `, // html body
        };
  
        mail.sendMail(mailOptions, (err, info) => {
          if (err) return console.log(err);
          console.log(`Message sent: ${info} `)
        });
      })
    } catch (err) {
      next(err);
    }
  }

  async emailValidator(req, res, str) {
    let p = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    if (!p.test(str)) {
        return this.alertAndBack(req, res, {
          position: 'top-end',
          type: 'error',
          title: 'لطفا یک ایمیل معتبر را وارد کنید.',
          showConfirmButton: false,
          toast: true,
          timer: 4000
      })
    }
  }

  async validationData(req) {
    const result = validationResult(req);
    if (! result.isEmpty()) {
        const errors = result.array();
        const messages = [];
       
        errors.forEach(err => messages.push(err.msg));
        req.flash('errors' , messages)

        return false;
    }

    return true;
  }

  just_number(str) {
    let n = /^\d+$/;

    if (! n.test(str)) return false;
    return true;
  }
};