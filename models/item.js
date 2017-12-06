const mongoose= require("mongoose");

const itemSchema= new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    used: Boolean,
    price: Number,
    createdAt:{type: Date, default:Date.now},
    author:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:{type: String, default:"Admin"}
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});

module.exports=mongoose.model("item", itemSchema);