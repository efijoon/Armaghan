const controller = require('app/http/controllers/controller');
const Subscriber = require('../../../models/subscriber');

class subscriberController extends controller {
    async index(req , res) {
        try {
            let page = req.query.page || 1;
            let subscribers = await Subscriber.paginate({} , { page , sort : { createdAt : -1 } , limit : 8 });

            res.render('admin/subscribers/index',  { subscribers });
        } catch (err) {
            next(err);
        }
    }

    async addSubscriber(req , res) {
        let { email } = req.body;

        let p = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

        if (!p.test(email) || email == '') {
            return this.alertAndBack(req, res, {
                position: 'center',
                type: 'error',
                title: 'لطفا یک ایمیل معتبر را وارد کنید.',
                showConfirmButton: false,
                toast: true,
                timer: 4000
            })
        }

        let newSubscriber = new Subscriber({
            email
        });

        await newSubscriber.save();

        this.alertAndBack(req, res, {
            position: 'center',
            type: 'success',
            title: 'ایمیل شما با موفقیت ثبت شد. منتظر خبرها باشید...',
            showConfirmButton: false,
            toast: true,
            timer: 4000
        })
    }

    async removeSubscriber(req , res) {
        let subscriber = await Subscriber.findById(req.params.id);

        await subscriber.remove();

        res.redirect('/admin/subscribers')
    }

}

module.exports = new subscriberController();