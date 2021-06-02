var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");
const shortid = require("shortid");


var placementSchema = new mongoose.Schema({
    status:{type:String,default:"OPEN"},
    pid:{type:String,default:shortid.generate},
    name:{type:String},
    ctc:{type:Number},
    files:[{
        name:String,
        url:String
    }],
    branches:[String],
    min_cgpa:Number,
    updates:[String],
    users:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        isSelected:{type:Boolean,default:false},
        resume_url:String
    }],
    round:{type:Number,default:1}

});



module.exports = mongoose.model("Placement", placementSchema);

