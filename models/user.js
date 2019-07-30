const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default:
            'https://minervastrategies.com/wp-content/uploads/2016/03/default-avatar.jpg'
    },
    googleId: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    oAuth:{
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    favoriteItineraries: {
        type: Array
    }
})
module.exports = mongoose.model('user', usersSchema)


