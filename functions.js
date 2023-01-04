const User = require('./models/user');

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

module.exports = {
    getDate,
    changpass,
}

