const express= require("express");
const router= express.Router({mergeParams: true});
const Item= require("../models/item");
const Comment= require("../models/comment");
const middleware= require("../middlewares");

// ref: app.use("/items/:id/comments", commentRoutes);


/**New Route**/

router.get("/new", middleware.isLoggedIn, (req, res)=>{
   Item.findById(req.params.id,(err, foundItem)=>{
       if(err){
           //TODO error handler
       }else{
           res.render("comments/new", {item: foundItem});
       }
   })
});

/**Create Route**/

router.post("/", middleware.isLoggedIn, (req, res)=>{
   Item.findById(req.params.id, (err, foundItem)=>{
      if(err){
          //TODO error handler
          res.redirect("/items");
      } else{
          Comment.create(req.body.comment, (err, comment)=>{
              if(err){
                  //TODO error handler
                  req.flash("error", "Something went wrong");
              }else{
                  comment.author.id= req.user._id;
                  comment.author.username= req.user.username;
                  comment.save();
                  foundItem.comments.push(comment);
                  foundItem.save();
                  req.flash("success","Successfully added comment");
                  res.redirect(`/items/${foundItem._id}`);
              }
          });
      }
   });
});

/**Edit Route**/

router.get("/:comment_id/edit", middleware.checkCommentOwnership,(req, res)=>{
    Comment.findById(req.params.comment_id, (err, foundComment)=>{
        if(err){
            res.redirect("back");
        } else{
            res.render("comments/edit", {
                item_id: req.params.id,
                comment: foundComment
            });
        }
    });
});

/**Update Route**/
//TODO why put here
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err)=>{
        if(err){
            res.redirect("back");
        }else{
            res.redirect(`/items/${req.params.id}`);
        }
    });
});

/**Delete Route**/
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
   Comment.findByIdAndRemove(req.params.comment_id,(err)=>{
       if(err){
           //TODO error handler
       }else{
           req.flash("success", "Comment deleted");
           res.redirect("/items/"+req.params.id);
       }
    });
});

/*******/
module.exports= router;