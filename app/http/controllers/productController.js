const controller = require("./controller");
const Product = require("../../models/product");
const Category = require("../../models/category");
const User = require("../../models/user");
const request = require("request-promise");
const Payment = require("../../models/payment");
const UngivenOrder = require("../../models/ungivenOrder");
const Comment = require("../../models/comment");
const fetch = require("node-fetch");
const product = require("../../models/product");

class ProductController extends controller {
  constructor() {
    super();
    this.cart = [];
  }

  async index(req, res) {
    let page = req.query.page || 1;

    let categories = await Category.find({ parent: null })
      .populate("childs")
      .exec();

    if (req.query.category) {
      const products = await Product.paginate(
        { category: req.query.category },
        { page, sort: { createdAt: "-1" }, limit: 15 }
      );
      return res.render("product/products", { products, categories });
    }

    const products = await Product.paginate(
      {},
      { page, sort: { createdAt: "-1" }, limit: 15 }
    );
    res.render("product/products", { products, categories });
  }

  async showInfoProductPage(req, res) {
    if (!this.isMongoId(req.query.pi)) return this.back(req, res);
    // For the product that is chosen to see
    const product = await Product.findById(req.query.pi)
      .populate([
        {
          path: "user",
          select: "name image",
        },
      ])
      .populate([
        {
          path: "comments",
          match: {
            parent: null,
            approved: true,
          },
          populate: [
            {
              path: "user",
              select: "name image",
            },
            {
              path: "comments",
              match: {
                approved: true,
              },
              populate: { path: "user", select: "name image" },
            },
          ],
        },
      ]);

    // Increase view count
    product.viewCount += 1;
    await product.save();

    // For the related products part
    const lastSixProducts = await Product.find()
      .sort({ createdAt: "-1" })
      .limit(6);
    let sameCategoryProducts = await Product.find({
      category: product.category,
    })
      .limit(6)
      .select("name desc image price");

    let productInCart = false;
    if (req.isAuthenticated()) {
      const user = await User.findById(req.user.id);

      let favouriteExist = false;

      user.cart.forEach((p) => {
        if (p.id == product.id) productInCart = true;
      });

      user.favourite.forEach((p) => {
        if (p.id == product.id) favouriteExist = true;
      });

      res.render("product/single-product", {
        product,
        productInCart,
        favouriteExist,
        lastSixProducts,
        sameCategoryProducts,
      });
    } else {
      if (this.cart.length > 0) {
        this.cart.forEach((p) => {
          if (p.id == product.id) productInCart = true;
        });
      }

      res.render("product/single-product", {
        product,
        lastSixProducts,
        sameCategoryProducts,
        productInCart,
      });
    }
  }

  async showUserCartPage(req, res) {
    const user = await User.findById(req.user.id);

    let array = [];
    user.cart.forEach((p) => {
      array.push(p.id);
    });
    const products = await Product.find({ _id: array }).select("_id count");

    res.render("product/user-cart", {
      cart: user.cart,
      layout: "dashboard/master",
      products,
    });
  }

  async addToCart(req, res) {
    if (!this.isMongoId(req.params.id)) return this.back(req, res);

    const product = await Product.findById(req.params.id).populate("category");

    let obj = {
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      category: product.category.name,
      count: 1,
    };

    if (req.isAuthenticated()) {
      const user = await User.findById(req.user.id);

      const existProduct = user.cart.filter(p => p.id == product.id);
      if(existProduct.length > 0) return this.back(req, res);

      user.cart.push(obj);
      await user.save();
    } else {
      const existProduct = this.cart.filter(p => p.id == product.id);
      if(existProduct.length > 0) return this.back(req, res);

      this.cart.push(obj);
    }

    return this.alertAndBack(req, res, {
      title: "محصول با موفقیت به سبد خرید شما افزوده شد.",
      type: "success",
      toast: true,
      position: "center",
    });
  }

  async addToFavourite(req, res) {
    if (!this.isMongoId(req.params.id)) return this.back(req, res);

    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user.id);

    user.favourite.push({ id: product.id });
    await user.save();

    return this.alertAndBack(req, res, {
      title: "محصول با موفقیت به علاقه مندی های شما افزوده شد.",
      type: "success",
      toast: true,
      position: "center",
    });
  }

  async removeFromCart(req, res) {
    if (!this.isMongoId(req.params.id)) return this.back(req, res);

    if (req.isAuthenticated()) {
      const user = await User.findById(req.user.id);

      user.cart.forEach(async (p, i) => {
        if (p.id == req.params.id) user.cart.splice(i, 1);
      });
      await user.save();
    } else {
        this.cart.forEach(async (p, i) => {
            if (p.id == req.params.id) this.cart.splice(i, 1);
        });
    }

    if (req.url == "cart") res.send(req.params.id);
    else {
      return this.alertAndBack(req, res, {
        title: "محصول با موفقیت از سبد خرید شما شد.",
        type: "success",
        toast: true,
        position: "center",
      });
    }
  }

  async removeFromFavourite(req, res) {
    if (!this.isMongoId(req.params.id)) return this.back(req, res);

    const user = await User.findById(req.user.id);

    user.favourite.forEach(async (p, i) => {
      if (p.id == req.params.id) user.favourite.splice(i, 1);
    });
    await user.save();

    return this.alertAndBack(req, res, {
      title: "محصول با موفقیت از علاقه مندی های شما حذف شد.",
      type: "success",
      toast: true,
      position: "center",
    });
  }

  async increaseCountInCart(req, res) {
    this.countUpdater(req, res, true);
  }

  async decreaseCountInCart(req, res) {
    this.countUpdater(req, res, false);
  }

  async favouriteProducts(req, res) {
    if (!this.isMongoId(req.params.id)) return this.back(req, res);
    let page = req.query.page || 1;

    const user = await User.findById(req.user.id);

    let productIDs = [];
    user.favourite.forEach((product) => {
      productIDs.push(product.id);
    });

    let products = await Product.paginate(
      { _id: productIDs },
      { page, limit: 5, populate: { path: "category", select: "name" } }
    );

    res.render("product/favouriteProducts", {
      products,
      layout: "dashboard/master",
    });
  }

  async boughtProducts(req, res) {
    if (!this.isMongoId(req.params.id)) return this.back(req, res);

    const user = await User.findById(req.user.id).populate({
      path: "products.id",
    });

    res.render("product/boughtProducts", { user, layout: "dashboard/master" });
  }

  async countUpdater(req, res, inc) {
    // newCount is the count of products ordered by customer
    let newCount = 0;

    let cart = [];
    if (!this.isMongoId(req.params.id)) return this.back(req, res);

    // This is for updating the count of the product in anbar
    const product = await Product.findById(req.params.id);

    if(req.isAuthenticated()) {
      const user = await User.findById(req.user.id);
      cart = user.cart;
    } else {
      cart = this.cart;
    }

    cart.forEach(async (p, i) => {
      // Find the proper product in users cart to update the count of that and that products in product table in database
      if (p.id == req.params.id) {
        if (p.count > 0 && p.count !== 1) {

          if (inc) {

            // This is fo that product count in cart doesn't get higher than the product count in database
            if (product.count > p.count) p.count += 1;

          } else p.count -= 1;

          newCount = p.count;

          req.isAuthenticated() && await User.updateOne({ _id: req.user.id }, { $set: { cart } });
          this.cart = cart;
          res.send(`${newCount}`);
        } else {
          // p.count is 1

          if (inc) {
            p.count += 1;
          }

          newCount = p.count;

          req.isAuthenticated() && await User.updateOne({ _id: req.user.id }, { $set: { cart } });

          res.send(`${newCount}`);
        }
      }
    });
  }

  async searchInProduct(req, res) {
    let array = [];
    let page = req.query.page || 1;
    let text = req.body.searchedText;

    const allProducts = await Product.find();
    allProducts.forEach((product) => {
      if (product.name.includes(text)) array.push(product.id);
    });
    let products = await Product.paginate(
      { _id: array },
      { page, sort: { createdAt: 1 }, limit: 15 }
    );
    let categories = await Category.find({ parent: null })
      .populate("childs")
      .exec();

    res.render("product/products", {
      products,
      categories,
      searchedText: text,
    });
  }

  async completeSendInfo(req, res) {
    res.render("product/completeSendInfo", { layout: "dashboard/master" });
  }

  async purchaseCart(req, res) {
    res.render("product/purchaseCart", { cart: this.cart });
  }

  async completePurchase(req, res) {
    if(this.cart.length === 0) return res.redirect('/');
    res.render("product/completePurchase");
  }

  async buyInformation(req, res) {
    res.render("product/buyInformation");
  }

  async payment(req, res, next) {
    try {
      let { address, telephone, city, username, email, postalCode } = req.body;

      if (address == "" || telephone == "" || email == "" || postalCode == "" || city == "") {
        return this.alertAndBack(req, res, {
          title: "لطفا مقادیر خواسته شده را وارد کنید.",
          type: "error",
          toast: true,
          position: "center",
        });
      }

      if (!this.just_number(telephone)) {
        return this.alertAndBack(req, res, {
          title: "لطفا مقدار تلفن را به صورت عدد وارد کنید.",
          type: "error",
          toast: true,
          position: "center",
        });
      }

      let Amount = 0;
      let productIds = [];

      if(req.isAuthenticated()) {
        let user = await User.findById(req.user.id);
        if (user.cart.length <= 0) {
          return this.alertAndBack(req, res, {
            title: "شما محصولی در سبد خرید خود ندارید.",
            type: "error",
            position: "center",
            toast: true,
          });
        }

        user.cart.forEach(async (product) => {
          Amount += (product.price * product.count);
          productIds.push(product.id);
        });
      } else {
        this.cart.forEach(async (product) => {
          Amount += (product.price * product.count);
          productIds.push(product.id);
        });
      }

      let notavailable = false;
      const products = await Product.find({ _id: productIds });
      products.forEach((p) => {
        if (p.count <= 0) notavailable = true;
      });

      if (notavailable) {
        return this.alertAndBack(req, res, {
          title: "دقت کنید",
          message:
            "شما محصولی را در سبد خرید خود دارید که فرد دیگری این محصول را زودتز از شما خریداری کرده و هم اکنون موجودی این محصول در انبار به پایان رسیده است. اگر هنوز هم قصد خرید این محصول را دارید، ابتدا این محصول را از سبد خرید خود حذف کنید و منتظر موجود شدن این محصول بمانید.از خرید و اعتماد شما متشکریم.",
          type: "error",
          timer: 30000,
          button: "خیلی خوب",
        });
      }

      // buy proccess
      let params = {
        MerchantID: "d53a145f-b2c5-4dc5-afc0-cced9493aecf",
        Amount,
        CallbackURL: process.env.ZARIN_CALLBACKURL,
        Description: `بابت خرید محصول از فروشگاه اینترنتی ارمغان`,
        Email: req.user ? req.user.email : email,
      };

      let options = this.getUrlOption(
        "https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json",
        params
      );

      request(options)
        .then(async (data) => {
          
          if(req.isAuthenticated()) {
            let payment = new Payment({
              user: req.user.id,
              username: `${req.user.name} ${req.user.family}`,
              resnumber: data.Authority,
              price: Amount,
              address,
              telephone,
              postalCode,
              city
            });
  
            user.cart.forEach((p) => {
              payment.products.push({ id: p.id, count: p.count });
            });

            await payment.save();
          } else {
            let payment = new Payment({
              username: username,
              resnumber: data.Authority,
              price: Amount,
              address,
              telephone,
              postalCode,
              city
            });
            
            this.cart.forEach((p) => {
              payment.products.push({ id: p.id, count: p.count });
            });

            await payment.save();
          }

          res.redirect(
            `https://www.zarinpal.com/pg/StartPay/${data.Authority}`
          );
        })
        .catch((err) => res.json(err.message));
    } catch (err) {
      next(err);
    }
  }

  async checker(req, res, next) { 
    try {

      if (req.query.Status && req.query.Status !== "OK") {
        return this.alertAndBack(req, res, {
          title: "دقت کنید",
          message: "پرداخت شما با موفقیت انجام نشد",
        });
      }

      let payment = await Payment.findOne({ resnumber: req.query.Authority });

      if (payment.products.length == 0) {
        return this.alertAndBack(req, res, {
          title: "دقت کنید",
          message: "شما محصولی را خریداری نکرده اید.",
          type: "info",
        });
      }

      let params = {
        MerchantID: "d53a145f-b2c5-4dc5-afc0-cced9493aecf",
        Amount: payment.price,
        Authority: req.query.Authority,
      };

      let options = this.getUrlOption(
        "https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json",
        params
      );

      request(options)
        .then(async (data) => {
          if (data.Status == 100) {

            // thep = the product
            let boughtProduct;
            let userBoughtProductsID = [];

            payment.set({ payment: true });

            if(req.isAuthenticated()) {
              let user = await User.findById(req.user.id);

              user.points += 10;
              user.cart = [];
              
              user.products.forEach((product) => {
                userBoughtProductsID.push(`${product.id}`);
              });
            } else {
              this.cart = [];
            }

            let ungivenOrders = await UngivenOrder.find();
            const newUngivenOrder = await UngivenOrder({
              index: ungivenOrders.length + 1,
              address: payment.address,
              telephone: payment.telephone,
              customer: payment.username,
              city: payment.city,
              postalCode: payment.postalCode
            });

            payment.products.forEach(async (p) => {
              if (userBoughtProductsID.indexOf(p.id) == -1) {
                // User hadn't baught this product yet
                if(req.isAuthenticated()) user.products.push({ id: p.id, count: p.count }); 
              } else {
                // User had baught this product in past
                if(req.isAuthenticated())  {
                  user.products.forEach((userProduct) => {
                    if (userProduct.id == p.id) userProduct.count += p.count;
                  });
                }
              }
              newUngivenOrder.products.push({ product: p.id, count: p.count });

              boughtProduct = await Product.findById(p.id);
              boughtProduct.count -= p.count;
              await boughtProduct.save();
            });

            await newUngivenOrder.save();
            await payment.save();
            req.user && await user.save();

            this.alert(req, {
              title: "با تشکر",
              message: "عملیات مورد نظر با موفقیت انجام شد",
              type: "success",
              button: "بسیار خوب",
            });

            if(req.isAuthenticated()) {
              res.redirect("/dashboard/dashboard");
            } else {
              res.redirect("/");
            }

          } else {
            this.alertAndBack(req, res, {
              title: "پرداخت شما با موفقیت انجام نشد",
              type: "info",
              toast: true,
              position: "center",
            });
          }
        })
        .catch((err) => {
          next(err);
        });
    } catch (err) {
      next(err);
    }
  }

  async comment(req, res, next) {
    try {
      if (req.body.comment == "" || req.body.product == "") {
        return this.alertAndBack(req, res, {
          title: "لطفا تمامی مقادیر لازم را وارد کنید.",
          type: "success",
          toast: true,
          position: "center",
        });
      }

      let newComment = new Comment({
        user: req.user.id,
        ...req.body,
      });

      await newComment.save();

      return this.alertAndBack(req, res, {
        title:
          "نظر شما با موفقیت ثبت شد و پس از تایید شدن به نمایش در می آید. از توجه شما متشکریم.",
        type: "success",
        toast: true,
        position: "center",
      });
    } catch (err) {
      next(err);
    }
  }

  getUrlOption(url, params) {
    return {
      method: "POST",
      uri: url,
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: params,
      json: true,
    };
  }
}

module.exports = new ProductController();
