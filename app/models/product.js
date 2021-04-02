const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const productSchema = Schema({
    user : { type : Schema.Types.ObjectId , ref : 'User'},
    category : { type : Schema.Types.ObjectId, ref : 'Category' , default : null },
    desc: { type : String , default : 'یکی از محصولات خوب و با کیفیت فروشگاه' },
    name : { type : String, requried: true },
    price : { type : Number, default : null },
    viewCount : { type : Number, default : 0 },
    commentCount : { type : Number, default : 0 },
    awailable : { type : Boolean, default: true },
    image: { type : String, requried: true },
    images: { type : Array, default: [] },
    count : { type : Number , default  : 0 }
} , { timestamps : true , toJSON : { virtuals : true } });

productSchema.plugin(mongoosePaginate);
 
productSchema.virtual('comments' , {
    ref : 'Comment',
    localField : '_id',
    foreignField : 'product'
});

module.exports = mongoose.model('Product' , productSchema);