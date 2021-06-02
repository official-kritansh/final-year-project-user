const express = require("express");
var router = express.Router({ mergeParams: true }),
    passport = require("passport"),
    {f1uEvent,f2uEvent,f3uEvent,f4uEvent,f5uEvent,f6uEvent,f7uEvent } = require("../../controller/user/event"),
    { isUser } = require("../../middleware/index");


router.get('/new',isUser,f1uEvent);

router.post('/new',isUser,f2uEvent);

router.get('/search',isUser,f3uEvent);

router.post('/publish',isUser,f4uEvent);

router.post('/add-content',isUser,f5uEvent);

router.post('/invite',isUser,f6uEvent);

router.get('/request',isUser,f7uEvent);

module.exports =router;

