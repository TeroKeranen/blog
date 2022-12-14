// require express
const express = require('express');
const { default: mongoose } = require('mongoose');
const User = require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
mongoose.set('strictQuery', true);


const dbUser = "mongodb+srv://netninja:tero123@cluster0.xecqchu.mongodb.net/blogsite?retryWrites=true&w=majority"


mongoose.connect(dbUser, {useNewUrlParser: true})
    .then((result) => console.log("connected to db"))
    .catch((err) => console.log(err))

// render to home (index) page
app.get('/', (req,res) => {
    res.render('index', {title: 'All blogs'});
})

app.get('/about', (req,res) => {
    res.render('about', {title: 'About'})
})

app.get("/login", (req,res) => {
    res.render('login', {title: "Login"});
})

app.get("/register", (req,res) => {
    res.render('register', {title: 'Register'});
})

app.post("/register", (req,res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    })
    newUser.save((err) => {
        if(err) {
            console.log(err)
        }
        else {
            res.render("secret", {title: "secret"})

        }
    });
})

app.post("/login", (req,res) => {
    const user = req.body.username;
    const passwordUser = req.body.password;

    User.findOne({username:user}, (err, foundUser) => {
        if(err) {
            console.log(err)
        } else {
            if(foundUser) {
                if(foundUser.password === passwordUser) {
                    res.render('secret', {title: "secret"})
                }
            }
        }
    })
})





app.listen(3000, function () {
    console.log('Server started on port 3000')
})