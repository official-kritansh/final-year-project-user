var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");
const shortid = require("shortid");


var userSchema = new mongoose.Schema({
    uid:{type:String,default:shortid.generate},
    name:{type:String},
    cgpa:{type:Number},
    password: String,
    email: { type: String, unique: true, required: true,index:true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    mobile: Number,
    otp: Number,
    otpExpires: Date,
    typeof: { type: String, default: 'user' },
    events:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event"
    }],
    admin_events:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Event"
    }],
    notifications:[{
        isInvite:{type:Boolean,default:false},
        isReq:{type:Boolean,default:false},
        event:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Event"
        },
        by:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        isAccepted:{type:Boolean,default:false},
        isRejected:{type:Boolean,default:false}
    }]
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });



module.exports = mongoose.model("User", userSchema);

