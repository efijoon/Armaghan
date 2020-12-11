const mongoose = require('mongoose');

const passwordReset = mongoose.Schema({
    email : { type : String , required : true},
    token : { type : String , required : true} ,
} , { timestamps : { updatedAt : false } });


module.exports = mongoose.model('passwordReset' , passwordReset);