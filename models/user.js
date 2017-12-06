const mongoose= require("mongoose");
const passportLocalMongoose= require("passport-local-mongoose");

const userSchema= new mongoose.Schema({
    username:{
        type: String,
        unique: true,
        required: true
    },
    password: String,
    firstName: String,
    lastName: String,
    isAdmin: {type: Boolean, default: false},
    avatar: String,// TODO: add default for the avatar
    email:{
      type: String,
      unique: true,
      required: true
    },
    favItem:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date

});
// TODO what is option means
const options={
    errorMessage:{
        IncorrectPasswordError: "Password is incorrect",
        IncorrectUsernameError: "Username is incorrect"
    }
};
// here we plugin the passport-local mongoose into our UserSchema
//You're free to define your User how you like, Passport-Local Mongoose will
// add a username, hash and salt field to store the username, the hashed password and the salt value
// Additionally Passport-Local Mongoose adds some methods to your Schema.
// See https://github.com/saintedlama/passport-local-mongoose for more detail
userSchema.plugin(passportLocalMongoose, options);
// here the username is used in default as the field name that holds the username.
// we can use username Fields in option to use a different field to hold the username for example "email"
module.exports= mongoose.model("User", userSchema);