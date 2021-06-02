var User =require("../models/user");


module.exports ={
    isUser(req,res,next){
        if(req.isAuthenticated()&&req.user.typeof=='user'){
            return next();
        }else{
            res.redirect("/");
        }
    }
}