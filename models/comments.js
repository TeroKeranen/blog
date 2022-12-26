const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    username: {
        type:String
    },
    comment: {
        type: String
    },
    id: {
        type: String
    }
})


const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment;