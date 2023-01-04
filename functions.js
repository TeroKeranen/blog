const User = require('./models/user');
const Blog = require('./models/blog');

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

module.exports = {
    getDate,
    changpass,
    findBlog,
    findBlogById,
    findByIdAndDelete,
}

