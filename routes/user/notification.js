const express = require("express");
var router = express.Router({ mergeParams: true }),
    passport = require("passport"),
    {f1uNotif,f2uNotif } = require("../../controller/user/notification"),
    { isUser } = require("../../middleware/index");


router.get('/',isUser,f1uNotif);

router.get('/:response',isUser,f2uNotif);


module.exports =router;