var Item = require("../models/item");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkItemOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Item.findById(req.params.id, function(err, foundItem){
            if(err || !foundItem){
                req.flash("error", "Item not found");
                res.redirect("back");
            }  else {
                if(foundItem.author.id.equals(req.user._id) ) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            }  else {
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        let errors= req.flash("error", "You need to be logged in to do that");
        res.redirect("back", {"errors": errors});
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;
