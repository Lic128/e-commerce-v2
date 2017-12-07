const express = require('express');
const router = express.Router({mergeParams:true});
const passport= require("passport");
const User= require("../models/user");
const async= require("async");
const nodemailer= require("nodemailer");
const crypto= require("crypto");

/**Index Route**/
router.get("/", (req, res)=>{
  res.render('landing');
});
/**About Route**/
router.get("/about", (req, res)=>{
   res.render("about", {page:"about"});
});
/**Register Routes**/


router.get("/register", (req,res)=>{
  res.render("register", {page:"register"});
});

router.post("/register", (req, res)=>{
  var newUser= new User(
      {
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email
      }
  );
  console.log(newUser);
  //use the method provided by passport-local-mongoose to register a user;
  User.register(newUser, req.body.password, (err, user)=>{
    if(err){
        req.flash("error", err.message);
        return res.render("register",{error: err.message});
    }
    passport.authenticate("local")(req, res, ()=>{
      req.flash("success", "Welcome to SimpleSell, "+user.username);
      res.redirect("/items");
    });
  });
});

/**Login Route**/

router.get("/login", (req, res)=>{
  res.render("login", {page: "login"});
});

//在处理登陆请求的路由中， 加入登陆处理的配置信息， 然后passport会
//自动帮你处理是否登陆成功。
//  ref: router.post('/login', passport.authenticate('local', options),  success_callback);
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/items",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: " Welcome back!"
    }), (req, res)=>{
    }
)
;

/**LogOut Route**/
//这里属于在方法中使用校验， 使用其实很简单， passport在这里扩展了
//一些内置方法：
// request.logIn(user, options, callback)： 将登录用户存入session。
// request.logOut()：退出登录用户，删除session信息。
// request.isAuthenticated()：判断当前请求的用户是否已授权（已登录），返回true或false
// request.isUnauthenticated()：跟request.isAuthenticated()相反。
router.get("/logout", (req, res)=>{
    req.logout();
    req.flash("success", "See you next time!");
    res.redirect("back");
});

/**Reset Password Route**/
router.get("/forgot",(req, res)=>{
   res.render("forgot");
});

router.post("/forgot", (req, res, next)=>{
    async.waterfall([
        (done)=>{
            crypto.randomBytes(20, (err, buf)=>{
               var token= buf.toString("hex");
               done(err, token);
            });
        },
        (token, done)=>{
            User.findOne({email: req.body.email},(err, user)=>{
               if(!user){
                   console.log("No Account");
                   req.flash("error", "No Account with that email address exists.");
                   return res.redirect("/forgot");
               }
               user.resetPasswordToken= token;
               user.resetPasswordExpires= Date.now()+3600000;
               user.save((err)=>{
                   done(err, token, user);
               });
            });
        },
        (token, user, done)=>{
            var smtpTransport= nodemailer.createTransport({
                service: "Gmail",
                auth:{
                    user:'liyanchen128@gmail.com',// your own account
                    pass: "362502Cly"// you own password
                }
            });
            const mailOptions={
                to: user.email,
                from:'liyanchen128@gmail.com',
                subject:"Password Reset",
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, (err)=>{
               req.flash("success", `An e-mail has been sent to ${user.email} with further instructions` );
               done(err,'done');
            });
        }

    ], (err)=>{
        if(err) return next(err);
        res.redirect("/forgot");
    });
});


router.get('/reset/:token', (req, res)=>{
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user)=>{
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

router.post('/reset/:token', (req, res)=>{
    async.waterfall([
        (done)=>{
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user)=>{
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save((err)=>{
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        (user, done)=>{
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'liyanchen128@gmail.com',
                    pass: "362502Cly"
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'liyanchen128@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], (err)=>{
        res.redirect('/items');
    });
});

/****/

module.exports = router;
