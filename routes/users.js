const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userModel = require('../models/user');
const itineraryModel = require('../models/itinerary');
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require('passport');

/*get all users*/
router.get("/all",
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userModel.find({})
            .then(users => {
                res.json(
                    users.map(e => {
                        return {
                            id: e.id,
                            name: e.name,
                            email: e.email
                        }
                    }
                    ))
            })
            .catch(err => res.status(404).json({ error: "No users" }));
    }
);

/*get user by ID*/
router.get('/id/:id',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log('req :', req);
        const { id } = req.params
        userModel.findOne({ _id: id })
            .then(response => {
                // remove password before sending back
                const userDetails = Object.assign({}, response._doc);
                delete userDetails.password;

                res.json(userDetails);
            })
            .catch(err => res.status(404).json({ error: "User does not exist!" }));
    }
);

/* register user*/
router.post('/register', async (req, res) => {
    const { name, email, password, img } = req.body
    try {
        let user = await userModel.findOne({ email })
        if (user) {
            res.status(400).json({ errors: [{ msg: 'Email taken.' }] })
        }
        if (!password) {
            res.status(400).json({ errors: [{ msg: 'Please enter a valid password.' }] })
        }
        user = new userModel({
            name,
            email,
            img,
            password,
            oAuth: false
        })
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        await user.save()
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload,
            keys.secret,
            {
                expiresIn: 2592000
            },
            (err, token) => {
                res.json({
                    user,
                    success: true,
                    token: 'bearer ' + token,
                });
            }
        );

    } catch (err) {
        console.error(err)
        res.status(500).send('Server error')
    }
})

/*email login*/
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    //find user by email
    userModel.findOne({ email })
        .then(user => {
            //check if user exists
            if (!user) {
                return res.status(400).json({ error: 'Email not found' });
            }
            if (user.oAuth) {
                return res.status(400).json({ error: 'OAuth user, connect with Google' });
            }
            if (!password) {
                return res.status(400).json({ error: 'Enter password' });
            }
            //check password
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {

                    const payload = {
                        user: {
                            id: user.id
                        }
                    }
                    jwt.sign(
                        payload,
                        keys.secret,
                        {
                            expiresIn: 2592000
                        },
                        (err, token) => {
                            res.json({
                                user,
                                success: true,
                                token
                            });
                        }
                    );
                } else {
                    return res
                        .status(400)
                        .json({ passwordincorrect: 'Password incorrect' })
                }
            })
                .catch(err => console.log(err));
        });
});

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    let user = req.user
    console.log('user :', user);
    const payload = {
        user: {
            id: user.id
        }
    }
    jwt.sign(
        payload,
        keys.secret,
        {
            expiresIn: 2592000
        },
        (err, token) => {
            res.json({
                user,
                success: true,
                token,
            });
        }
    );
    //redirect to front-end
    //res.redirect('/');
});


/*add  itinerary to user favorites*/
router.post('/addToFavorite',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userModel.findOne({ _id: req.user.id })
            .then(user => {

                let currentFavItineraries = user.favoriteItineraries.filter(oneFavItin => oneFavItin.itineraryId === req.body.itineraryId)

                if (currentFavItineraries.length !== 0) {
                    res
                        .status(400)
                        .json({ error: "User already liked this itinerary!" });
                } else {
                    itineraryModel.findOne({ _id: req.body.itineraryId })
                        .then(itinerary => {
                            // console.log(itinerary)
                            user.favoriteItineraries.push({
                                itineraryId: req.body.itineraryId,
                                name: itinerary.title,
                                cityId: itinerary.city
                            });

                            user
                                .save()
                                .then(userFavItin => res.json(user.favoriteItineraries))
                                .catch(err => {
                                    res
                                        .status(500)
                                        .json({ error: 'The itinerary could not be saved' })
                                })
                        })
                        .catch(err => {
                            res
                                .status(404)
                                .json({ error: 'Cannot find the itinerary with this id!' })
                        })
                }
            })
            .catch(err => {
                res
                    .status(404)
                    .json({ error: 'User not found' })
            })
    }
);

/*remove itinerary from user favorites*/
router.post('/removeFromFavorite',
    /* Uncomment next line to add web token athentification */
    //passport.authenticate("jwt", { session: false }),
    (req, res) => {
        userModel.findOne({ _id: req.user.id })
            .then(user => {

                let currentFavItineraries = user.favoriteItineraries.filter(oneFavItin =>
                    oneFavItin.itineraryId === req.body.itineraryId)
                if (currentFavItineraries.length === 0) {
                    res
                        .status(400)
                        .json({ error: "User did not like this itinerary!" });
                }
                itineraryModel.findOne({ _id: req.body.itineraryId })
                    .then(itinerary => {
                        const indexItinToRemove = user.favoriteItineraries.map(oneFavItin =>
                            oneFavItin.itineraryId).indexOf(req.body.itineraryId);
                        console.log(indexItinToRemove)
                        user.favoriteItineraries.splice(indexItinToRemove, 1);
                        user
                            .save()
                            .then(userFavItin => res.json(user.favoriteItineraries))
                            .catch(err => {
                                res
                                    .status(500)
                                    .json({ error: 'There was a saving error' })
                            })
                    })
                    .catch(err => {
                        res
                            .status(404)
                            .json({ error: 'Cannot find the itinerary with this id!' })
                    })
            })
            .catch(err => {
                res
                    .status(404)
                    .json({ error: 'User not found' })
            })
    }
);


module.exports = router