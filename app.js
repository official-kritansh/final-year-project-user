const express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    flash = require('connect-flash'),
    User = require("./models/user"),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    port = process.env.PORT || 5000,
    dotenv = require('dotenv'),
    sslRedirect = require("heroku-ssl-redirect"),
    passportLocalMongoose = require("passport-local-mongoose");
dotenv.config();


// app config-----
app.use(cookieParser('secret'));
app.use(require("express-session")({
    secret: "This is a marketing panel",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    }

}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// add user ROUTES
const userAuthRoutes =require('./routes/user/auth');
const userEventRoutes =require('./routes/user/event');
const userNotifRoutes =require('./routes/user/notification');
const userPlacementRoutes =require('./routes/user/placement');

// mongoose config
// const mongoURI = "mongodb+srv://muku:"+process.env.mongo_pass+"@cluster0.cxuqe.mongodb.net/stickman?retryWrites=true&w=majority"
// mongoose.connect("mongodb://localhost/stickman_real_art");
// const mongoURI = "mongodb://localhost/final_year_project_v1";
// const mongoURI = "mongodb+srv://ankit:"+process.env.MLAB_PASS+"@cluster0-gyowo.mongodb.net/real_art?retryWrites=true&w=majority";
// const mongoURI = "mongodb+srv://ankit:" + process.env.mongo_pass + "@cluster0.f8aql.mongodb.net/mravans_admin_v4?retryWrites=true&w=majority";
const mongoURI ="mongodb+srv://kintu2676:"+process.env.mongo_pass+"@cluster0.kw5s2.mongodb.net/major_project?retryWrites=true&w=majority"

//Mongo connection
mongoose.connect(mongoURI);

//PASSPORT config

// passport.use('user', new localStrategy(User.authenticate()));
passport.use('user', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, User.authenticate()));
// passport.use('employee', new localStrategy(Employee.authenticate()));
passport.serializeUser(function(user, done) {
    var key = {
        id: user.id,
        type: user.typeof
    }
    done(null, key);
})
passport.deserializeUser(function(key, done) {
    if (key.type === 'user') {
        User.findOne({
            _id: key.id
        }, function(err, user) {
            done(err, user);
        })
    }

})

app.get('/',(req,res)=>{
    if(req.user){
        if(req.isAuthenticated()&&req.user.typeof=="user"){
            res.redirect("/home");
        }else{
            res.render("index");
        }
    }else{
        res.render("index");
    }
})

// Use User Routes
app.use('/',userAuthRoutes)
app.use('/event',userEventRoutes)
app.use('/notification',userNotifRoutes)
app.use('/placement',userPlacementRoutes)



app.listen(port, () => {
    console.log("Server Started on " + port);
})