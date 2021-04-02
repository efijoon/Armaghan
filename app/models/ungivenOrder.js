const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const ungivenOrdersSchema = Schema({
    index : { type : Number , required : true},
    products : [
        {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        count: {
            type: Number
        }
      }
    ],
    address : { type : String , required : true},
    telephone : { type : String , required : true},
    customer : { type : Schema.Types.ObjectId, ref: 'User', required : true},
    sent : { type : Boolean, default : false },
} , { timestamps : true , toJSON : { virtuals : true } });

ungivenOrdersSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('UngivenOrders' , ungivenOrdersSchema);