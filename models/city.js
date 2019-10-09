const mongoose = require('mongoose')

const citiesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default:
            'https://res.cloudinary.com/ds3w3iwbk/image/upload/v1570632597/MERN/20180519_150452.jpg'

    }
})

//name if module is the singular of how the database is called
module.exports = mongoose.model('city', citiesSchema)