const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const paymentSchema = Schema({
    user : { type : Schema.Types.ObjectId , ref : 'User' },
    username : { type : String, required: true },
    products : { type : Array, default : [] },
    resnumber : { type : String , required : true},
    address : { type : String , required : true},
    telephone : { type : String , required : true},
    postalCode : { type : String , required : true},
    email : { type : String , required : true},
    city : { type : String , required : true},
    province : { type : String , required : true},
    password : { type : String , default : '' },
    code : { type : Number , default : Math.floor(1000 + Math.random() * 90000) },
    price : { type : Number , required : true},
    payment : { type : Boolean , default : false },
} , { timestamps : true , toJSON : { virtuals : true } });

paymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment' , paymentSchema);