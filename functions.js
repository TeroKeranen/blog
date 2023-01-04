const User = require('./models/user');
const Blog = require('./models/blog');
const session = require('express-session');
const passport = require('passport') 

// Get current date function
function getDate ()  {
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    let day = today.toLocaleDateString('fi-FI', options);
    
    return day;
};

// change your password function
function changpass (req,res) {
    //this use current logged user username
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
    
}


// find blogs function, this return all blogs to home page
function findBlog(req,res) {

    Blog.find()
        .then((result)=> {
            res.render('home', {title: 'blogs', blogs: result})
        })
        .catch((err) => {
            console.log(err);
        })
}

// find blog by id to app.get("/home/:id"

function findBlogById (req,res) {
    const pageId = req.params.id; // get page id
    const setUserId = req.user.id; // Haetaan kirjautuneen id

    Blog.findById(pageId)
        .then(result => {
            let blogCreaterId = result.id; // Haetaan blogista id, joka on sama kuin tekstin luoja user.id
            res.render('details', {title: 'testi', blog: result, setUserId,blogCreaterId, pageId})
        })
        .catch(err => {
            console.log(err)
        })
}

// Function to delele your own post

function findByIdAndDelete (req,res) {

    const id = req.params.id; // get blog post id;
    
    // find that id in the database and delete it
    Blog.findByIdAndDelete(id)
        .then(result => {
            res.json({redirect: '/home'})
        })
        .catch(err => console.log(err));

}

// app.post('/home' this function make a new blog post, save the blog, find ur username in the database and update ur posted blogs info

function makeNewBlogPost (req,res) {

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
    
    // save a new blog post
    blog.save()
        .then((result) => {
            res.redirect('/home')
        })
        .catch((err) => console.log(err));
    
    // find you user in the database and update posted blogs number
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
}


// app.post("/home/:id" Post a comment to blogs
function postComment (req,res) {

    const user = req.user.username; // Get username
    const userComment = req.body.comment // Get comment that user post
    const id = req.params.id;
    const commentDate = getDate(); // get date when comment posted

    // Add comment to database with username 
    Blog.updateOne({_id:id},{$push: {comments: {comment: userComment, userCom: user,commetDate: commentDate}}}, (err) => {
         if(err) {
             console.log(err)
         } else {
             res.redirect(`${id}`);
         }
     } )
}

function registerFunc (req,res) {
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
}

// Login function 
function logIn (req,res) {
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
}

module.exports = {
    getDate,
    changpass,
    findBlog,
    findBlogById,
    findByIdAndDelete,
    makeNewBlogPost,
    postComment,
    registerFunc,
    logIn,
}

