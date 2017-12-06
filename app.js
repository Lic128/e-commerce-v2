const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride= require("method-override");
const flash= require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const mongoose= require("mongoose");
const Item= require("./models/item");
const User= require("./models/user");
const Comment= require("./models/comment");
const seedDB= require("./seeds");

// requiring routes
var commentRoutes= require("./routes/comments");
var itemRoutes= require("./routes/items");
var indexRoutes= require("./routes/index");
var userRoutes= require("./routes/users");



var app = express();


//mongoose setup
const url = process.env.DATABASEURL || "mongodb://localhost/e-commerce";
mongoose.connect(url);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride("_method"));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


app.use(logger('dev'));
// 其中BodyParser.urlencoded的参数extended决定解释类型， 为false时， 只能解释
//key-value 组合（String, Array）； 为true时， 可解释任何类型。
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());




// PASSPORT CONFIGURATION

//config the session which passport depend on
app.use(require("express-session")({
    secret: "e-commerce",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// configure the passport middleware
//first configure the strategy, here we use passport-local-mongoose as the local strategy.
passport.use(new LocalStrategy(User.authenticate()));
// serialize User: when the user is authenticate
// , the user profile is stored in the session, here we store the
// user we use in the strategy before
passport.serializeUser(User.serializeUser());
// deserializer will retrieve the user object when called everytime from session
passport.deserializeUser(User.deserializeUser());


app.locals.moment= require("moment");

// 是一个从express剥离的组件， 简单读取文档可以了解flash的信息会保存在session中。
app.use(flash());

// by define the app middleware, now every view will have access to any error or success
// messages that you flash.
app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
//seedDB();
// Routes Setting
app.use('/', indexRoutes);
app.use('/items', itemRoutes);
app.use('/items/:id/comments', commentRoutes);
app.use("/users", userRoutes);

// app.listen(3000, process.env.IP, ()=>{
//     console.log("The YelpCamp Server Has Started!");
// });
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });



module.exports = app;
