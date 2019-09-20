const express = require('express');
const router = express.Router();
const passport = require('passport');

const cityModel = require('../models/city')

/* Sprint 1 - test city route*/
router.get('/test', (req, res) => {
    res.send({ msg: 'city test route' })
})

/*Sprint 1 - get all cities*/
router.get('/all',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        cityModel.find({})
            .then(files => {
                res.send(files)
            })
            .catch(err => console.log(err));
    });

/*Sprint 1 -  add city*/
router.post('/',
    /* Uncomment next line to add web token athentification */
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { name, country, img } = req.body
        cityModel.find({ 'name': name }, (err, city) => {
            if (err) throw err;
            console.log('city', city)
            if (city) res.send({
                error: `The city ${city[0].name} already exists in the Database`,
                city: city[0]
            })
        })
        let addCity = new cityModel({
            name,
            country,
            img
        })
        console.log(addCity)
        addCity.save((err, files) => {
            if (err) { console.log(err) }
            res.status(201).json(files)
        })

    });

module.exports = router;