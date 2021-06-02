const express = require("express");
var router = express.Router({ mergeParams: true }),
    passport = require("passport"),
    {f1,f2,f3 } = require("../../controller/user/placement"),
    { isUser } = require("../../middleware/index");


router.get('/',isUser,f1);

router.post('/join',isUser,f2);

router.get('/updates',isUser,f3);

module.exports=router;