const express = require('express');
const router = express.Router();
const passport = require('passport');

const cityModel = require('../../models/city')


/*get all cities*/
router.get('/',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        cityModel.find({})
            .then(files => {
                res.send(files)
            })
            .catch(err => console.log(err));
    });

/* add city*/
router.post('/',
    /* Uncomment next line to add web token athentification */
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { name, country, img } = req.body
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