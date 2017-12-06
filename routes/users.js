var express = require('express');
var router = express.Router();
const Mongoose= require("mongoose");
const User= require("../models/user");
const Item= require("../models/item");

/**User Profile**/
router.get("/:id", (req, res)=>{
  User.findById(req.params.id, (err, foundUser)=>{

    Item.find().where("author.id").equals(foundUser._id).exec((err, items)=>{
        if(err){
            req.flash("error", "Something went wrong!");
            res.redirect("/");
        }
        res.render("users/show",{user: foundUser, items: items});
    });
  });
});

module.exports = router;
