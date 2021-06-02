const { all } = require("../../routes/user/event");

var mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    otpGenerator = require('otp-generator'),
    localStrategy = require("passport-local"),
    User = require('../../models/user'),
    Event =require('../../models/event'),
    async = require("async"),
    nodemailer = require("nodemailer"),
    fs = require('fs'),
    path = require('path'),
    jwt = require("jsonwebtoken"),
    crypto = require("crypto"),
    dotenv = require('dotenv'),
    { google } = require("googleapis"),
    // {nodemailerSendEmail}=require("../../nodemailer/nodemailer");
    OAuth2 = google.auth.OAuth2,
    passportLocalMongoose = require("passport-local-mongoose");
dotenv.config();

// const oauth2Client = new OAuth2(
//     process.env.clientId, // ClientID
//     process.env.clientSecret, // Client Secret
//     "https://developers.google.com/oauthplayground" // Redirect URL
// );
// oauth2Client.setCredentials({
//     refresh_token: process.env.refreshToken
// });
// const accessToken = oauth2Client.getAccessToken()



module.exports = {
    f1uAuth(req, res, next) {
        passport.authenticate('user', (err, user, info) => {
            if (err) {
                console.log(err);
                res.redirect("/login")
            } else if (!user) {
                if (!req.body.email || !req.body.password) {
                    console.log("error,insufficient creds")
                    req.flash("error","Please enter credentials")
                    res.redirect("/login")
                } else {
                    // console.log("inside")
                    req.flash("error","Wrong username or password")
                    res.redirect("/login");
                }
            }
            else {
                // console.log("hello");
                req.logIn(user, function (err) {
                    if (err) {
                        console.log(err);
                        res.redirect("/login");
                    }
                    // console.log(req.user)
                    req.flash("success","Sucessfully logged in!")
                    return res.redirect("/home");
                });
                // console.log(user);
                
                
            }

        })(req, res, next);
    },

    f2uAuth(req,res){
        User.findOne({_id:req.user._id}).populate('events').populate('admin_events').exec((err,user)=>{
            if(err){
                req.flash("error","Something Went Wrong");
                res.redirect("/")
            }else{
                Event.find({}).populate('admin').exec((err,allEvents)=>{
                    if(err){
                        req.flash("error","Something Went Wrong");
                        res.redirect("/")
                    }else{
                        allEvents=allEvents.filter((e)=>{
                            if( e.admin._id.toString()==user._id.toString()  || e.coAdmins.includes(user._id) || e.users.includes(user._id) || e.users_requested.includes(user._id)){
                                return false;
                            }else{
                                return true
                            }
                        })
                        res.render('user/home',{events:user.events,my_events:user.admin_events,all_events:allEvents});
                    }
                })
                
            }
        })
    },

    f3uAuth(req,res){
        req.logOut();
        res.redirect('/');
    },

    f4uAuth(req,res){
        User.findOne({_id:req.user._id}).exec((err,user)=>{
            if(err){
                req.flash("error","Something Went Wrong");
                res.redirect("/");
            }else{
                res.render('user/profile',{user:user});
            }
        })
    },

    f5uAuth(req,res){
        User.findOne({_id:req.user._id}).exec(async(err,user)=>{
            if(err){
                req.flash("error","Something Went Wrong");
                res.redirect("/");
            }else{
                user.name =req.body.username;
                user.cgpa =Number(req.body.cgpa);
                await user.save();
                res.redirect('back');
            }
        })
    }

}