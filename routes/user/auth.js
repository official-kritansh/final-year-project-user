const express = require("express");
const { route } = require("./event");
var router = express.Router({ mergeParams: true }),
    passport = require("passport"),
    User = require("../../models/user"),
    { f1uAuth,f2uAuth,f3uAuth, f4uAuth,f5uAuth } = require("../../controller/user/auth"),
    { isUser } = require("../../middleware/index");
// @route to register page
router.get('/register',(req,res)=>{
    res.render('user/register');
});

// POST route to register
router.post('/register',(req,res)=>{
    let user ={
        name:req.body.name,
        email:req.body.email,
        mobile:Number(req.body.mobile)
    }
    User.register(new User(user), req.body.password, (err, admin) => {
        if (err) {
            req.flash("error","Something went wrong!")
            res.redirect("/")
        }else{
            res.redirect('/login');
        }
    });
})

// @route to login page
router.get('/login',(req,res)=>{
    if(req.user){
        if(req.isAuthenticated()&&req.user.typeof=="user"){
            res.redirect("/home");
        }else{
            res.render("user/login");
        }
    }else{
        res.render("user/login");
    }
});

// @post route to login
router.post('/login',f1uAuth);

// @ route to home
router.get('/home',isUser,f2uAuth);

// @ route to logout
router.get('/logout',isUser,f3uAuth);

router.get('/profile',isUser,f4uAuth);

router.post('/profile',isUser,f5uAuth);


module.exports = router;