const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const user = require('./../models/user');
mongoose.model('user');
const keys = require('./keys');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  user.findById(id).then((user) => {
    done(null, user);
  });
});



const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secret;

module.exports = passport => {
  passport.use(
    new GoogleStrategy({
      // options for google strategy
      clientID: keys.google.clientID,
      clientSecret: keys.google.clientSecret,
      callbackURL: '/api/users/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
      // check if user already exists in our own db
      user.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          // already have this user
          console.log('user is: ', currentUser);
          done(null, currentUser);
        } else {
          // if not, create user in our db
          new user({
            googleId: profile.id,
            name: profile.displayName,
            img: profile.photos[0].value,
            oAuth: true,
            email: profile.emails[0].value,
          }).save().then((newUser) => {
            console.log('created new user: ', newUser);
            done(null, newUser);
          });
        }
      });
    })
  );

  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    //jwt payload used for authentication 
    console.log("jwt", jwt_payload)
    user.findById(jwt_payload.user.id)
      .then(user => {
        if (user) {
          console.log(user)
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
  })
  );

}


