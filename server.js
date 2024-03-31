/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

const ga = require('universal-analytics');

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({ success: false, msg: 'Please include both username and password to signup.' })
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function (err) {
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.' });
                else
                    return res.json(err);
            }

            res.json({ success: true, msg: 'Successfully created new user.' })
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function (err, user) {
        if (err) {
            res.send(err);
        }

        // Check if user exists before comparing password
        if (user) {
            user.comparePassword(userNew.password, function (isMatch) {
                if (isMatch) {
                    var userToken = { id: user.id, username: user.username };
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json({ success: true, token: 'JWT ' + token });
                }
                else {
                    res.status(401).send({ success: false, msg: 'Authentication failed.' });
                }
            });
        } else {
            res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
        }
    })
});

router.route('/movies')
    .get((req, res) => {
        Movie.find({}, (err, movies) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.json(movies);
        });
    })
    .post((req, res) => {
        if (!req.body.title || !req.body.releaseDate || !req.body.genre || !req.body.actors) {
            res.json({ success: false, msg: 'Please include all required fields: title, releaseDate, genre, and actors.' });
        } else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.releaseDate = req.body.releaseDate;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;

            movie.save((err) => {
                if (err) res.status(500).send(err);
                res.json({ success: true, msg: 'Successfully created new movie.' });
            });
        }
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        Movie.findOneAndUpdate({ title: req.body.title }, req.body, { new: true }, (err, movie) => {
            if (err) res.status(500).send(err);
            res.json({ success: true, msg: 'Successfully updated movie.' });
        });
    })
    .delete(authController.isAuthenticated, (req, res) => {
        Movie.findOneAndDelete({ title: req.body.title }, (err) => {
            if (err) res.status(500).send(err);
            res.json({ success: true, msg: 'Successfully deleted movie.' });
        });
    })
    .all((req, res) => {
        res.status(405).send({ status: 405, message: 'HTTP method not supported.' });
    });

// route to create a review
router.post('/reviews', function (req, res) {
    var review = new Review();
    review.movieId = req.body.movieId;
    review.username = req.body.username;
    review.review = req.body.review;
    review.rating = req.body.rating;

    // Create a new visitor with a unique user id
    var visitor = ga('UA-XXXX-Y', 'userId'); // Replace 'UA-XXXX-Y' with your actual tracking ID

    // Send event to Google Analytics
    visitor.event({
        ea: '/reviews', // Event Action
        el: 'API Request for Movie Review', // Event Label
        ev: 1, // Event Value
        cd1: req.body.movieId, // Custom Dimension 1: Movie Name
        cm1: 1 // Custom Metric 1: Review Count
    }).send();

    review.save(function (err) {
        if (err) {
            res.send(err);
        }
        res.json({ message: 'Review created!' });
    });
});

// route to get all reviews
router.get('/reviews', function (req, res) {
    Review.find(function (err, reviews) {
        if (err) {
            res.send(err);
        }
        res.json(reviews);
    });
});

// route to delete a review
router.delete('/reviews/:review_id', function (req, res) {
    Review.remove({
        _id: req.params.review_id
    }, function (err, review) {
        if (err) {
            res.send(err);
        }
        res.json({ message: 'Successfully deleted' });
    });
});

router.get('/movies', function (req, res) {
    if (req.query.reviews === 'true') {
        Movie.aggregate([
            {
                $lookup: {
                    from: "reviews",
                    localField: "_id", // field in the movies collection
                    foreignField: "movieId", // field in the reviews collection
                    as: "reviews" // output array where the joined reviews will be placed
                }
            }
        ]).exec(function (err, movies) {
            if (err) {
                res.send(err);
            } else {
                res.json(movies);
            }
        });
    } else {
        Movie.find(function (err, movies) {
            if (err) {
                res.send(err);
            }
            res.json(movies);
        });
    }
});

app.use('/', router);
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
})
module.exports = app; // for testing only
