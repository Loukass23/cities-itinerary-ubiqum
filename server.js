
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const passport = require('passport');

//importing Mongo DB credentials (git ignore)
const db = require('./config/keys').mongoURI;

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors())
mongoose.connect(db, { useNewUrlParser: true, useCreateIndex: true })
    .then(() => console.log('Connection to Mongo DB established'))
    .catch(err => console.log(err));


//importing the routes
const cityRoutes = require('./routes/cities');
const itineraryRoutes = require('./routes/itineraries');
const userRoutes = require('./routes/users');


//passport configuration
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

//using the routes for a specific api
app.use('/cities', cityRoutes);
app.use('/itineraries', itineraryRoutes);
app.use('/users', userRoutes);

//TO REMOVE -> google domain verification
app.get('/google1132ff054dbd1d04.html', function (req, res) {
    res.send('google-site-verification: google1132ff054dbd1d04.html');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
});


