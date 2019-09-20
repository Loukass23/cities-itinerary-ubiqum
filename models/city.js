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

    }
})

//name if module is the singular of how the database is called
module.exports = mongoose.model('city', citiesSchema)