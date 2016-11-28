var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Search = require('bing-search');
require('dotenv').config({
  silent: true
});
var app = express();

var historySchema = new Schema({
  term: String,
  when: String
});

var History = mongoose.model('History', historySchema);
var mongouri = process.env.MONGOLAB_URI || "mongodb://" + process.env.IP + ":27017/img-sal";
mongoose.connect(mongouri);
//mongo.MongoClient.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/img-sal', function(err, db) {

 // The format follows as, alias to use for real path, also allows permission to such path.

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  
  
  var port = process.env.PORT || 8080;
  app.listen(port, function() {
    console.log('Node.js listening on port ' + port);
  });
  
  

 app.route('/')
    .get(function(req, res) {
      res.render('index', {
        err: "Error: You need to add a proper action, see examples below."
      });
    });
  
app.route('/latest')
    // Retrieve most recent searches
    .get(getHistory);

  app.get('/:query', handlePost);

  function handlePost(req, res) {
    // Get images and save query and date.
    var query = req.params.query;
    var size = req.query.offset || 10;
    var search = new Search(process.env.API_KEY);
    var history = {
      "term": query,
      "when": new Date().toLocaleString()
    };
    // Save query and time to the database
    if (query !== 'favicon.ico') {
      save(history);
    }

    // Query the image and populate results
    search.images(query, {
        top: size
      },
      function(err, results) {
        if (err) throw err;
        res.send(results.map(makeList));
      }
    );
  }

  function makeList(img) {
    // Construct object from the json result
    return {
      "url": img.url,
      "snippet": img.title,
      "thumbnail": img.thumbnail.url,
      "context": img.sourceUrl
    };
  }

  function save(obj) {
    // Save object into db.
    var history = new History(obj);
    history.save(function(err, history) {
      if (err) throw err;
      console.log('Saved ' + history);
    });
  }

  function getHistory(req, res) {
    // Check to see if the site is already there
    History.find({}, null, {
      "limit": 10,
      "sort": {
        "when": -1
      }
    }, function(err, history) {
      if (err) return console.error(err);
      console.log(history);
      res.send(history.map(function(arg) {
        // Displays only the field we need to show.
        return {
          term: arg.term,
          when: arg.when
        };
      }));
    });
  }