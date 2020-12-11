const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const subscriberSchema = Schema({
    email : { type: String, required: true },
} , { timestamps : true , toJSON : { virtuals : true } });

subscriberSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Subscriber' , subscriberSchema);