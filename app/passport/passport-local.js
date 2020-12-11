const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('app/models/user');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
   
passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


passport.use('local.register' , new localStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
} , (req , email ,  password , done) => {
    User.findOne({ email } , async (err , user) => {

        if(err) return done(err);
        if(user) return done(err , false);

        const newUser = new User({
            name : req.body.name,
            family : req.body.family,
            email,
        });

        newUser.$set({ password : newUser.hashPassword(password) });
        await newUser.save();

        newUser.save(err => {
            if(err) return done(err , false);
            done(null, newUser);
        })
    })
}))


passport.use('local.login' , new localStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
} , (req , email ,  password , done) => {
    User.findOne({ email } , (err , user) => {
        if(err) return done(err);

        if(! user || ! user.comparePassword(password)) {
            return done(null , false);
        }
        done(null, user);
    })
}))