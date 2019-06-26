const express = require('express');
const router = express.Router();
//importing the itinerary model
const itineraryModel = require('../../models/itinerary')

/*get all itineraries*/
router.get('/all',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        itineraryModel.find()
            //telling mongoose to populate the field city in the itineraries model with the value of id and name of the model city
            // .populate('comments', ['username', 'date', 'avatarPicture', 'message'])
            .then(files => {
                res.send(files)
            })
            .catch(err => console.log(err))
    })

/*get itineraries by city name*/
router.get('/:city',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { city } = req.params
        itineraryModel.find({ 'city': city }, (err, itineraryList) => {
            if (err) throw err;
            res.send(itineraryList)
        })
    });

/*add itinerary*/
router.post('/',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log(req.body)
        const { city, title, img, summary, duration,
            price, rating } = req.body
        let addItinerary = new itineraryModel({
            city,
            title,
            img,
            summary,
            duration,
            price,
            rating
        })
        addItinerary.save((err, files) => {
            if (err) { console.log(err) }
            res.status(201).json(files)
        })

    });

module.exports = router