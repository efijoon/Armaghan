const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const commentSchema = Schema({
    user : { type : Schema.Types.ObjectId , ref : 'User'},
    parent : { type : Schema.Types.ObjectId , ref : 'Comment' , default : null },
    approved : { type : Boolean , default : false },
    product : { type : Schema.Types.ObjectId , ref : 'Product', required: true },
    comment : { type : String , required  : true}
} , { timestamps : true , toJSON : { virtuals : true } });

commentSchema.plugin(mongoosePaginate);

commentSchema.virtual('comments' , {
    ref : 'Comment',
    localField : '_id',
    foreignField : 'parent'
});

module.exports = mongoose.model('Comment' , commentSchema);