const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    id: {
        type:String
    },
    username: {
        type: String
    },
    date: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
   
    body: {
        type: String,
        required: true
    },
    comments: [
        {
            comment: [{type:String}],
            userCom : String,
            commetDate: String,
        }
    ],
    
}, {timestamps:true})

const Blog = mongoose.model('Blog', blogSchema)
module.exports = Blog;