const User =require('../../models/user'),
Placement =require('../../models/placement');
const fs =require('fs'),
path =require('path'),
multer = require('multer'),
{ google } = require("googleapis");

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
  
  async function uploadToFirebaseDesign(req, res, type) {
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
              Placement.findOne({pid:req.body.pid,status:'OPEN'}).exec(async(err,program)=>{
                  if(err){
                    req.flash("error", "Something Went Wrong!");
                    return res.redirect('back')
                  }
                  if(!program){
                    req.flash("error", "Something Went Wrong!");
                    return res.redirect('back') 
                  }
                  program.users.push({
                      user:req.user._id,
                      isSelected:true,
                      resume_url:createPublicFileURL(uploadTo),
                  })
                  await program.save();
                  res.redirect('/placement')
              })
            }
          }
        );
      }
    });
  }
  

module.exports={
    f1(req,res){
        Placement.find({"users.user":req.user._id}).exec((err,programs)=>{
            if(err){
                req.flash("error", "Something Went Wrong!");
                return res.redirect('back') 
            }
            programs.forEach((p)=>{
                p.isSelected=p.users.find((e)=>e.user.toString()==req.user._id.toString()).isSelected;
            })
            res.render('placement',{programs:programs});
        })
    },

    f2(req,res){
        uploadToFirebaseDesign(req,res,'ffProject')
    },

    f3(req,res){
        Placement.findOne({status:'OPEN',pid:req.query.pid}).exec((err,program)=>{
            if(err){
                req.flash("error", "Something Went Wrong!");
                return res.redirect('back') 
            }
            if(!program){
                req.flash("error", "Something Went Wrong!");
                return res.redirect('back') 
            }
            res.render('placement_info',{program:program});
        })
    }
}