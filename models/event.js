var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    shortid =require("shortid");


var eventSchema = new mongoose.Schema({
    display_name:{type:String},
    name:{type:String,unique:true},
    eid:{type:String,default:shortid.generate},
    isPrivate:{type:Boolean,default:true},
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    coAdmins:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    updates:[{type:String}],
    files:[{
        url:{type:String},
        name:{type:String}
    }],
    users_requested:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
});




module.exports = mongoose.model("Event", eventSchema);

