
const express = require('express');
const { default: mongoose } = require('mongoose');
const dotenv = require("dotenv").config();
const Blog = require('./models/blog');

const session = require('express-session');
const passport = require('passport');
//
// import functions
const {getDate, changpass, findBlog, findBlogById, findByIdAndDelete, makeNewBlogPost, postComment, registerFunc, logIn} = require("./functions.js");
//  require mongoose model
const User = require('./models/user');
const { render } = require('ejs');
const app = express();
//
app.set('view engine', 'ejs'); // setup ejs
app.use(express.urlencoded({extended:true}))
app.use(express.static('public')) // setup css file
mongoose.set('strictQuery', true);
//
//


// Set up expressjs session handling middleware
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
//
// passport initialize middleware
app.use(passport.initialize());
//
// passport session middleware 
app.use(passport.session());
//
// mongoose db
const dbUser = process.env.MONGODB_URI
//
//Mongoose connect,
mongoose.connect(dbUser, {useNewUrlParser: true})
    .then((result) => console.log("connected to db"))
    .catch((err) => console.log(err))
//
//
// Passport 
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// render to index page, when you are not logged in
app.get('/', (req,res) => {

    res.render('index', {title: 'All blogs'});
})
//
//
// render to about page when not logged in
app.get('/about', (req,res) => {
    res.render('about', {title: 'About'})
})
//
//
// render home page when you are logged in
app.get('/home', (req,res) => {
    // use findBlog function to get all the blogs that have been made.
    findBlog(req,res);
})
//
//
//

app.get("/home/:id", (req,res) => {
    // check information in functions.js
    findBlogById(req,res);
})

// Tehdään tekstin poistamis mahdollisuus
app.delete('/home/:id', (req,res) => {

    findByIdAndDelete(req,res);
})
//
//
// When you are logged in you go this about page
app.get("/registeredAbout", (req,res) => {
    res.render('registeredAbout', {title: "about"})
})
//
//
// Go to registered index when logged in
app.get("/registeredIndex", (req,res) => {
    res.render("registeredIndex", {title: "home"} )
})
//
// render login page
app.get("/login", (req,res) => {
    
    res.render('login', {title: "Login"});
})
//
//
// Post new blog to home page when you are logged in
app.post('/home', (req,res) => {
    
    // check funtion info at functions.js
    makeNewBlogPost(req,res);

})
//
//
// Post a comment
app.post("/home/:id", (req,res) => {

    // Function that make commenting possible, check more information at functions.js
    postComment(req,res);
    
})
//
//
// when user go to new blog page it render to this create page
app.get("/blogs/create", (req,res) => {
    res.render('create', { title: "Create a new blog"});
})

app.get("/image", (req,res) => {
    res.render('image', {title: "Valitse kuva"})
})
//
//
// render register page
app.get("/register", (req,res) => {
    
    res.render('register', {title: 'Register'});
})
//
//
// render to changepassword page
app.get("/changepassword", (req,res) => {
    res.render('changepassword', {title: 'change password'})
})
//
//
// when you log in you will render to secret page
app.get('/secret', (req,res) => {

    const kirjautunut = req.isAuthenticated()
    const setUser = req.user.username; // display username in secret page
    
    if (req.isAuthenticated()) {
        
        res.render('secret', {title: "secret", user:setUser})
    } else {
        res.redirect('/login');
    }
})
//
//
// Logging out
app.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/');
})
// Change your password 
app.post("/changepassword", (req,res) => {
    
    // changepassword function
    changpass(req,res);
})
//
// Register new user
app.post("/register", (req,res) => {

    registerFunc(req,res);        
})
//
//
//
// Go to user information page
app.get("/omatTiedot", (req,res) => {

    const userName = req.user.username; // get ur username
    const numberOfPosts = req.user.posts; // get info how many post you made
    const registeredDate = req.user.registeredDate;  // Get info when you registered your username
    
    
    res.render("omatTiedot", {title: "Omat tiedot",userName,numberOfPosts, registeredDate})
})
//
//
// get login informations and log in.
app.post("/login", (req,res) => {
    
    
   logIn(req,res);
    
})
//
// start server on port 3000
const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log('Server started on port 3000')
})