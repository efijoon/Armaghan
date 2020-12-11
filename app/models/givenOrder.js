const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const givenOrdersSchema = Schema({
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
    customer : { type : String, required : true},
    sent : { type : Boolean, default : true },
} , { timestamps : true , toJSON : { virtuals : true } });

givenOrdersSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('GivenOrder' , givenOrdersSchema);