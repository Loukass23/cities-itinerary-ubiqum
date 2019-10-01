const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItinerarySchema = new Schema({
    city: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    summary: {
        type: String
    },
    duration: {
        type: String
    },
    price: {
        type: String
    },
    rating: {
        type: String

    }
});
module.exports = Itinerary = mongoose.model('itinerary', ItinerarySchema);
