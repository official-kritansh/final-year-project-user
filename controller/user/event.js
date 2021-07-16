const User = require("../../models/user");
const Event = require("../../models/event");
const fs =require('fs'),
path =require('path'),
multer = require('multer'),
{ google } = require("googleapis");
const { default: async } = require("async");

var storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload1 = multer({ storage: storage1 });

// Firebase initialization
const keyFilename = "./real-art-266416-firebase-adminsdk-56l76-afb14bdef2.json"; //replace this with api key file
const projectId = "real-art-266416" //replace with your project id
const bucketName = `${projectId}.appspot.com`;


const { Storage } = require('@google-cloud/storage'),
  storage = new Storage({
    keyFilename
  });


const bucket = storage.bucket(bucketName);

function createPublicFileURL(storageName) {
  return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(
    storageName
  )}`;
}

async function uploadToFirebaseDesign(req, res, type, event) {
  await upload1.single("file")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      req.flash("error", "Something Went Wrong!");
      res.redirect('back')
    } else if (err) {
      // An unknown error occurred when uploading.
      req.flash("error", "Something Went Wrong!");
      res.redirect('back')
    } else {
      // Everything went fine.
      // res.send(req.body.name)
      const fname = req.file.originalname + Date.now();
      const filePath = "./" + req.file.originalname;
      const uploadTo = type + "/" + fname;

      bucket.upload(
        filePath,
        {
          gzip: true,
          destination: uploadTo,
          public: true,
          metadata: { cacheControl: "public, max-age=300" },
        },
        async function (err, file) {
          if (err) {
            req.flash("error", "Something Went Wrong!");
            res.redirect('back')
          } else {
            event.files.push({
                url:createPublicFileURL(uploadTo),
                name:fname
            })
            await event.save();
            fs.unlink(path.join('./',req.file.originalname),(err)=>{
              if(err){
                req.flash("error", "Something Went Wrong!");
                res.redirect('back');
              }else{
                res.redirect('back')              }
            });
          }
        }
      );
    }
  });
}

module.exports = {
  f1uEvent(req, res) {
    res.render("user/event/new");
  },

  f2uEvent(req, res) {
    const event = {
      name: req.body.name,
      display_name: req.body.display_name,
      description: req.body.desc,
      isPrivate: req.body.event_type == "private" ? true : false,
      admin: req.user._id,
    };
    Event.create(event, (err, event) => {
      if (err) {
        req.flash("error", "Something Went Wrong!");
        res.redirect("/");
      } else {
        User.findOne({ _id: req.user._id }).exec(async (err, user) => {
          if (err) {
            req.flash("error", "Something Went Wrong!");
            res.redirect("/");
          } else {
            user.admin_events.push(event._id);
            await user.save();
            res.redirect("/");
          }
        });
      }
    });
  },

  f3uEvent(req, res) {
    Event.findOne({ eid: req.query.eid })
      .populate("users")
      .populate("coAdmins")
      .populate("admin")
      .exec((err, event) => {
        if (err) {
          req.flash("error", "Something Went Wrong!");
          res.redirect("/");
        } else {
          if (!event) {
            req.flash("error", "Something Went Wrong!");
            res.redirect("/");
          } else {
            const coAdmins = event.coAdmins.map((e) => e._id);
            let isAdmin = false;
            if (
              event.admin._id.toString() == req.user._id.toString() ||
              coAdmins.includes(req.user._id)
            ) {
              isAdmin = true;
            }
            res.render("user/event/event", {
              event: event,
              isAdmin: isAdmin,
              users: event.users,
            });
          }
        }
      });
  },

  f4uEvent(req, res) {
    Event.findOne({ eid: req.query.eid }).exec(async (err, event) => {
      if (err) {
        req.flash("error", "Something Went Wrong!");
        res.redirect("/");
      } else {
        if (!event) {
          req.flash("error", "Something Went Wrong!");
          res.redirect("/");
        } else {
          event.updates.push(req.body.message);
          await event.save();
          res.redirect("back");
        }
      }
    });
  },

  f5uEvent(req, res) {
    Event.findOne({ eid: req.query.eid }).exec(async (err, event) => {
      if (err) {
        req.flash("error", "Something Went Wrong!");
        res.redirect("/");
      } else {
        if (!event) {
          req.flash("error", "Something Went Wrong!");
          res.redirect("/");
        } else {
            await uploadToFirebaseDesign(req,res,'ffProject',event);
        }
      }
    });
  },

  f6uEvent(req, res) {
    Event.findOne({ eid: req.query.eid }).exec(async (err, event) => {
      if (err) {
        req.flash("error", "Something Went Wrong!");
        res.redirect("/");
      } else {
        if (!event) {
          req.flash("error", "Something Went Wrong!");
          res.redirect("/");
        } else {
          User.findOne({ email: req.body.email }).exec(async (err, user) => {
            if (err) {
              req.flash("error", "Something Went Wrong!");
              res.redirect("/");
            } else {
              if (!user) {
                req.flash("error", "Something Went Wrong!");
                res.redirect("/");
              } else {
                user.notifications.push({
                    isInvite:true,
                    isReq:false,
                    event:event._id,
                    by:req.user._id
                })
                await user.save();
                res.redirect("back");
              }
            }
          });
        }
      }
    });
  },

  f7uEvent(req, res) {
    Event.findOne({ eid: req.query.eid }).exec(async (err, event) => {
      if (err) {
        req.flash("error", "Something Went Wrong!");
        res.redirect("/");
      } else {
        if (!event) {
          req.flash("error", "Something Went Wrong!");
          res.redirect("/");
        } else {
          User.findOne({ _id: event.admin }).exec(async (err, user) => {
            if (err) {
              req.flash("error", "Something Went Wrong!");
              res.redirect("/");
            } else {
              if (!user) {
                req.flash("error", "Something Went Wrong!");
                res.redirect("/");
              } else {
                event.users_requested.push(req.user._id);
                user.notifications.push({
                    isReq:true,
                    isInvite:false,
                    event:event._id,
                    by:req.user._id
                })
                await user.save();
                await event.save();
                res.redirect("back");
              }
            }
          });
        }
      }
    });
  },

  f8uEvent(req,res){
    Event.findOne({eid:req.params.eid},async (err,event)=>{
      if(err){
        req.flash("error", "Something Went Wrong!");
        res.redirect("/");
      }else{
        if(!event){
          req.flash("error", "Something Went Wrong!");
          return res.redirect("back");
        }else{
          if(event.admin.toString()==req.user._id.toString() || event.coAdmins.includes(req.user._id)){
            event.updates=event.updates.filter((e)=>{
              return e!=req.params.uid;
            })
            await event.save();
            return res.redirect("back");
          }
          req.flash("error", "Something Went Wrong!");
          return res.redirect("back");
        }
      }
    })
  },

  f9uEvent(req,res){
    Event.findOne({eid:req.params.eid},async (err,event)=>{
      if(err){
        req.flash("error", "Something Went Wrong!");
        res.redirect("/");
      }else{
        if(!event){
          req.flash("error", "Something Went Wrong!");
          return res.redirect("back");
        }else{
          if(event.admin.toString()==req.user._id.toString() || event.coAdmins.includes(req.user._id)){
            event.files=event.files.filter((e)=>{
              return e._id!=req.params.fid;
            })
            await event.save();
            return res.redirect("back");
          }
          req.flash("error", "Something Went Wrong!");
          return res.redirect("back");
        }
      }
    })
  }
};
