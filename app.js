
const express = require('express');
const { default: mongoose } = require('mongoose');
const dotenv = require("dotenv").config();
const Blog = require('./models/blog');

const session = require('express-session');
const passport = require('passport');
//
// import functions
const {getDate, changpass, findBlog, findBlogById, findByIdAndDelete} = require("./functions.js");
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
app.get("/registeredIndex", (req,res) => {
    res.render("registeredIndex", {title: "home"} )
})
//
// render login page
app.get("/login", (req,res) => {
    
    res.render('login', {title: "Login"});
})


// Post new blog to home page when you are logged in
app.post('/home', (req,res) => {
    
    const userId = req.user.id;
    const numberOfPosts = req.user.posts;

    // Making new blog that include your username that you are logged in so we can display it to home page
    const blog = new Blog({
        id: req.user.id, //Annetaan tietokannalle sama id kuin mikä käyttäjän id on.
        username: req.user.username,
        title: req.body.title,
        body: req.body.body,
        date: getDate()

        
    })
    
    blog.save()
        .then((result) => {
            res.redirect('/home')
        })
        .catch((err) => console.log(err));
    

    User.findById(userId, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            result.set({
                posts: numberOfPosts + 1
            })
        }
        result.save((err) => {
            console.log(err);

        })
    })


})

app.post("/home/:id", (req,res) => {
    const user = req.user.username; // Get username
    const userComment = req.body.comment // Get comment that user post
    const id = req.params.id;
    const commentDate = getDate(); // get date when comment posted

    console.log(commentDate);

    

   
    // Add comment to database with username 
    Blog.updateOne({_id:id},{$push: {comments: {comment: userComment, userCom: user,commetDate: commentDate}}}, (err) => {
         if(err) {
             console.log(err)
         } else {
             res.redirect(`${id}`);
         }
     } )
    


    
})


//
// when user go to new blog page it render to this create page
app.get("/blogs/create", (req,res) => {
    res.render('create', { title: "Create a new blog"});
})

app.get("/image", (req,res) => {
    res.render('image', {title: "Valitse kuva"})
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

    const kirjautunut = req.isAuthenticated()
    const setUser = req.user.username; // display username in secret page
    
    if (req.isAuthenticated()) {
        
        res.render('secret', {title: "secret", user:setUser})
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
    
    // changepassword function
    changpass(req,res);
})
//
// Register new user
app.post("/register", (req,res) => {

    number = 0 // Add post number to database;
    const passwordInput = req.body.password; // get first password input
    const passwordInput2 = req.body.password2; // get second password input
    const userInput = req.body.username; // get username input
    
    const msg = "Salasanat eivät olleet samoja"; // display this when passwords is not same
    const usermsg = "Käyttäjänimi on jo käytössä"; // display this if username is taken
    

    // Try find entered username value in the User database, if user is already in database display error message on the page
    User.findOne({username: userInput}, function(err, foundUser) {

        
        // This tells us that user is already in database
        if(foundUser) {

            res.render('register', {usererr: usermsg, title: "Register"})
        
        // If username not found in database it will continue
        } else {

            // if password and password2 is not the same then error message will display
            if (passwordInput === passwordInput2) {

                User.register({username: req.body.username, posts: number, registeredDate: getDate()}, req.body.password, function(err, user) {
                
                    if(err) {
                        console.log(err)
                        res.redirect('/register')
        
                    } else {
            
                        passport.authenticate('local')(req,res,function() {
                        res.redirect('/secret');
                        })
                    }
                })
            
            // if passwords is not the same it will render back to register page and display a error message
            } else {
                res.render('register', {errmsg: msg, title: "Register"})
        
            }

        }
    })        
})
//
//
//
app.get("/omatTiedot", (req,res) => {

    const userName = req.user.username;
    const numberOfPosts = req.user.posts;
    const registeredDate = req.user.registeredDate;
    
    
    
    
    res.render("omatTiedot", {title: "Omat tiedot",userName,numberOfPosts, registeredDate})
})
//
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
                
                

                res.redirect('/home')

            })
        }
    } )
    
})
//
// start server on port 3000
const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
    console.log('Server started on port 3000')
})