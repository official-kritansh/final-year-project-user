const User =require('../../models/user'),
      Event =require('../../models/event');


module.exports ={
    f1uNotif(req,res){
        User.findOne({_id:req.user._id}).populate('notifications.by').populate('notifications.event').exec((err,user)=>{
            if(err){
                req.flash("error", "Something Went Wrong!");
                res.redirect("/");
            }else{
                res.render('user/notification',{notifications:user.notifications});
            }
        })
    },

    f2uNotif(req,res){
        User.findOne({_id:req.user._id}).populate('notifications.by').populate('notifications.event').exec(async(err,user)=>{
            if(err){
                req.flash("error", "Something Went Wrong!");
                res.redirect("/");
            }else{
                user.notifications.forEach(async(n)=>{
                    if(req.query.nid==n._id){
                        if(req.params.response=="1"){
                            n.isAccepted=true;
                            if(n.isInvite){
                                user.admin_events.push(n.event._id);
                                n.event.coAdmins.push(user._id);
                                await n.event.save();
                            }else{
                                n.by.events.push(n.event._id);
                                await n.by.save();
                                n.event.users.push(n.by._id);
                                n.event.users_requested =n.event.users_requested.filter((u)=>{
                                    return u.toString()!=n.by._id.toString();
                                })
                                await n.event.save();
                             
                            }
                        }else{
                            n.isRejected=true;
                            n.event.users_requested =n.event.users_requested.filter((u)=>{
                                return u.toString()!=n.by._id.toString();
                            })
                            await n.event.save();
                            
                        }
                    }
                })
                await user.save();
                res.redirect('back');
            }
        })
    }   
}