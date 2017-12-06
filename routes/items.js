const express= require("express");
const router= express.Router({mergeParams: true});
const Item= require("../models/item");
const middleware= require("../middlewares/index");
const multer= require("multer");

/**multer configuration**/
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'dbia2e4s9',
    api_key: "984146767366222",
    api_secret: "8Y1HB0onfCnPDHZ5kOHc5VlPKAU"
});
//TODO use ENV variables to keep the password simple
// ref: app.use("/items", itemRoutes);

/**Index Route**/

router.get("/",(req, res)=>{
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Item.find({ "name": regex }, (err, foundItems)=>{
            if(err) {
                console.log(err);
            } else {
                res.render("items/index", { items: foundItems });
            }
        });
    }else{
        Item.find({}, (err, items)=>{
            if(err){
                //TODO: error handler;
                console.log("Error happened");
                console.log(err);
            }else{
                // TODO if no match
                res.render("items/index", {items: items, page:"items"});
            }
        });
    }

});

/**New Route**/

router.get("/new", middleware.isLoggedIn, (req, res)=>{
    res.render("items/new.ejs");
});

/**Create Route**/

router.post("/", middleware.isLoggedIn,upload.single('image'), (req, res)=>{
    //TODO cooporate with ejs to update the return item;
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.item.image = result.secure_url;
        console.log(result.secure_url);
        // add author to campground
        req.body.item.author = {
            id: req.user._id,
            username: req.user.username
        };
        Item.create(req.body.item, function(err, item) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/items/' + item.id);
        });
    });
});

/**Show Route**/

router.get("/:id", (req, res)=>{
    //TODO check the meaning of this line
   Item.findById(req.params.id)
       .populate("comments")
       .exec((err, foundItem)=>{
       if(err){
           //TODO error handler
           console.log(err);
       }else{
           res.render("items/show", {item: foundItem});
       }
   }) ;
});

/**Edit Route**/
router.get("/:id/edit", middleware.checkItemOwnership, (req, res)=>{
    Item.findById(req.params.id, (err, foundItem)=>{
        if(err){
            res.redirect("/items");
        }else{
            res.render("items/edit", {item: foundItem});
        }
    })
});

/**Update Route**/
router.put("/:id", middleware.checkItemOwnership, (req, res)=>{

    Item.findByIdAndUpdate(req.params.id, req.body.item, (err, updatedItem)=>{
        if(err){
            //TODO error handler
            res.redirect("/items");
        }else{
            res.redirect(`/items/${req.params.id}`);
        }
    })
});


/**Destory Route**/

router.delete("/:id", middleware.checkItemOwnership,(req, res)=>{
    Item.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.redirect("/items");
        }else{
            //TODO error handler
            res.redirect("/items");
        }
    })
});
var escapeRegex=(text)=>{
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router;