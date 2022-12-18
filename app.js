
const express = require('express');
const { default: mongoose } = require('mongoose');
const Blog = require('./models/blog');
const session = require('express-session');
const passport = require('passport');
//
//  require mongoose model
const User = require('./models/user')
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
const dbUser = "mongodb+srv://netninja:tero123@cluster0.xecqchu.mongodb.net/blogsite?retryWrites=true&w=majority"
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
// render to about page when not logged in
app.get('/about', (req,res) => {
    res.render('about', {title: 'About'})
})
//
// render home page when you are logged in
app.get('/home', (req,res) => {
    // Find all the blogs that have been made.

     
    
    Blog.find()
        .then((result)=> {
            res.render('home', {title: 'blogs', blogs: result})
        })
        .catch((err) => {
            console.log(err);
        })
})
//
// When you are logged in you go this about page
app.get("/registeredAbout", (req,res) => {
    res.render('registeredAbout', {title: "about"})
})
//
// render login page
app.get("/login", (req,res) => {
    
    res.render('login', {title: "Login"});
})

// Post new blog to home page when you are logged in
app.post('/home', (req,res) => {
    
    // date that display when adding new blog to site
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    let day = today.toLocaleDateString('en-US', options);
    console.log(day);

    // Making new blog that include your username that you are logged in so we can display it to homa page
    const blog = new Blog({
        username: req.user.username,
        title: req.body.title,
        snippet: req.body.snippet,
        body: req.body.body,
        date: day
    })
    
    
    
    
    blog.save()
        .then((result) => {
            res.redirect('/home')
        })
        .catch((err) => console.log(err));

})
//
// when user go to new blog page it render to this create page
app.get("/blogs/create", (req,res) => {
    res.render('create', { title: "Create a new blog"});
})
//
// render register page
app.get("/register", (req,res) => {
    
    res.render('register', {title: 'Register'});
})

app.get("/changepassword", (req,res) => {
    res.render('changepassword', {title: 'change password'})
})
//
// when you log in you will render to secret page
app.get('/secret', (req,res) => {

    
    const setUser = req.user.username; // display username in secret page
    if (req.isAuthenticated()) {
        
        res.render('secret', {title: "secret", user:setUser })
    } else {
        res.redirect('/login');
    }
})
//
// Logging out
app.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/');
})
// Change your password 
app.post("/changepassword", (req,res) => {
    User.findByUsername(req.body.username, (err, user) => {
        if(err) {
            res.send(err)
        } else {
            user.changePassword(req.body.oldpassword, req.body.newpassword, function (err) {
                if(err) {
                    res.send(err);
                } else {
                    res.send('successfulu changed')
                }
            })
        }
    })
})
//
// Register new user
app.post("/register", (req,res) => {

   

    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if(err) {
            console.log(err)
            res.redirect('/register')
        } else {
            
            passport.authenticate('local')(req,res,function() {
                res.redirect('/secret');
            })
        }
    })    
})
//
// get login informations and log in.
app.post("/login", (req,res) => {

    // Make a new user object when logging in
    const user = new User({
        username:req.body.username,
        password:req.body.password
    })
    //
    // check if login informations is correct
    req.login(user, (err) => {
        if(err) {
            console.log(err)
            
        } else {
            passport.authenticate('local') (req,res, function () {
                res.redirect('/secret')
            })
        }
    } )
    
})
//
// start server on port 3000
app.listen(3000, function () {
    console.log('Server started on port 3000')
})