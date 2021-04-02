const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const uniqueString = require('unique-string')
const mongoosePaginate = require('mongoose-paginate');

const userSchema = Schema({
    name : { type : String , required : true },
    family : { type : String , required : true },
    image : { type : String , default : null },
    address : { type : String , default : null },
    telephone : { type : String , default : null },
    admin : { type : Boolean ,  default : 0 },
    email : { type : String , unique : true  ,required : true},
    password : { type : String ,  required : true },
    money : { type : Number ,  default : 0 },
    points : { type : Number ,  default : 0 },
    products : { type : [
        {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        count: {
            type: Number
        },
        status: {
            type: String,
            default: 'ungiven'
        }
      }
    ] ,  default : [] },
    cart : { type : Array ,  default : [] },
    favourite : { type : Array ,  default : [] },
    rememberToken : { type : String , default : null },
} , { timestamps : true , toJSON : { virtuals : true } });

userSchema.plugin(mongoosePaginate);

userSchema.methods.hashPassword = function(password) {
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(password , salt);

    return hash;
}

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password , this.password);
}

userSchema.methods.setRememberToken = function(res) {
    const token = uniqueString();
    res.cookie('remember_token' , token , { maxAge : 1000 * 60 * 60 * 24 * 90 , httpOnly : true , signed :true});
    this.updateOne({ rememberToken : token } , err => {
        if(err) console.log(err);
    });
}

module.exports = mongoose.model('User' , userSchema);

