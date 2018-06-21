// DEPENDENCIES =======================================
// =====================================================

var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var path = require('path');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require('axios');
var cheerio = require('cheerio');

// Require all models
var db = require('./models');

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();

// MIDDLEWARE =======================================
// =====================================================

// logger for logging request
app.use(logger('dev'));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static('public'));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoRecode database
var URI = 'mongodb://heroku_hvhpwj06:fm06uag73m6jp2tu839k2c0dc2@ds135810.mlab.com:35810/heroku_hvhpwj06';

var MONGODB_URI =
  URI || 'mongodb://localhost/mongoRecodeScrape';

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

const dbCheck = mongoose.connection;

dbCheck.on('error', (error) => {
  console.log('Mongoose Error: ', error);
});

dbCheck.once('open', () => {
  console.log('Mongoose connection successful');
});


// TODO: ROUTES =======================================
// =====================================================

// GET ROUTES =================
// ============================

// GET for scraping our site
app.get('/scrape', function(req, res) {
  // GET for scraping our site
  axios.get('http://recode.net').then(function(response) {
    // load cheerio
    var $ = cheerio.load(response.data);

    $('div.c-entry-box--compact__body').each(function(i, element) {
      var result = {};

      result.headline = $(this)
        .children('h2')
        .children('a')
        .text();
      result.URL = $(this)
        .children('h2')
        .children('a')
        .attr('href');
      result.summary = $(this)
        .children('.p-dek')
        .text();
      // console.log(result);
      
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
     
    });

    res.redirect('/');
  });
});

// GET the html
app.get('/saved', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/saved.html'));
});


// GET for getting all articles from DB
app.get('/articles', function(req, res) {
  db.Article
    .find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// GET route for getting a specific article and it's comments
app.get('/articles/:id', function(req, res) {
  db.article
    .findOne({ _id: req.params.id })
    .populate('comment')
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// POST ROUTES =================
// ============================

// POST route for updating and saving a comment
app.post('/articles/:id', function(req, res) {
  db.comment
    .create(req.body)
    .then(function(dbComment) {
      return db.article.findOneAndUpdate(
        { _id: req.params.id },
        { comment: dbComment._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// RUN IT =======================================
// =====================================================

app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
