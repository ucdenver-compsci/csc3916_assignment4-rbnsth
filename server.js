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

const crypto = require("crypto");
var rp = require('request-promise');

const GA_TRACKING_ID = process.env.GA_KEY;

function trackDimension(category, action, label, value, dimension, metric) {

    var options = {
        method: 'GET',
        url: 'https://www.google-analytics.com/collect',
        qs:
        {   // API Version.
            v: '1',
            // Tracking ID / Property ID.
            tid: GA_TRACKING_ID,
            // Random Client Identifier. Ideally, this should be a UUID that
            // is associated with particular user, device, or browser instance.
            cid: crypto.randomBytes(16).toString("hex"),
            // Event hit type.
            t: 'event',
            // Event category.
            ec: category,
            // Event action.
            ea: action,
            // Event label.
            el: label,
            // Event value.
            ev: value,
            // Custom Dimension
            cd1: dimension,
            // Custom Metric
            cm1: metric
        },
        headers:
            { 'Cache-Control': 'no-cache' }
    };

    return rp(options);
}

router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({ success: false, message: 'No token provided.' });
    }
});

// route to create a review
router.post('/reviews', function (req, res) {
    var review = new Review();
    review.movieId = req.body.movieId;
    review.username = req.body.username;
    review.review = req.body.review;
    review.rating = req.body.rating;
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

router.route('/reviews')
    .post(passport.authenticate('jwt', { session: false }), function (req, res) {
        var review = new Review();
        review.title = req.body.title;
        review.review = req.body.review;
        review.movieId = req.body.movieId;
        review.reviewer = req.body.reviewer;
        review.rating = req.body.rating;

        review.save(function (err) {
            if (err) {
                res.send(err);
            }

            // Track the event with Google Analytics
            trackDimension(
                'Review', // Event Category
                '/reviews', // Event Action
                'API Request for Movie Review', // Event Label
                '1', // Event Value
                review.title, // Custom Dimension (Movie Name)
                '1'  // Custom Metric (Requested: Value 1)
            ).then(function (response) {
                console.log(response.body);
                res.json({ message: 'Review created!' });
            }).catch(function (error) {
                console.error(error);
                res.json({ message: 'Review created, but failed to track event.' });
            });
        });
    });

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

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.get('/movies', function (req, res) {
    if (req.query.reviews === 'true') {
        Movie.aggregate([
            {
                $lookup: {
                    from: "reviews", // name of the foreign collection
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


