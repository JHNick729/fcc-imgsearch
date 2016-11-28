//api 3391c9a4d408fa29792ae6b90cae63b3
//secret 10122bff46afef17

var express = require('express')
var app = express();
var Flickr = require("flickrapi"),
  flickrOptions = {
    api_key: "3391c9a4d408fa29792ae6b90cae63b3",
    secret: "10122bff46afef17"
  };
var url = require('url');
var mongo = require('mongodb').MongoClient
var dburl = 'mongodb://swyx:Qt72nWPyNByw@ds111798.mlab.com:11798/heroku_p414n7r6'

app.get("/api/latest/imagesearch/",function(req,res){
  mongo.connect(dburl, function(err, db) {
      if (err) throw err
      var col = db.collection('fcc-urlshortener')
      res.writeHead(200, {"Content-Type": "text/plain"});
      col.find({},{_id:0,searchterm:1}).limit(10).toArray(function(err, docs) {
          if (err) throw err
          if (docs) {console.log(docs); res.end(JSON.stringify(docs));}
          db.close()
    })
  })
})

app.get("/", function(request, response) {  
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    // we can now use "flickr" as our API object,
    // but we can only call public methods and access public data
    flickr.photos.search({text: "panda",
      page: 1,
      per_page: 10
    }, function(err, result) {
      if(err) { throw new Error(err); }
      // do something with result
      console.log(result['photos']['photo'].map(potato));
    })
  });
  
  response.end("Welcome to the homepage!");})
app.get("/api/imagesearch/:url",function(req,res){
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    // we can now use "flickr" as our API object,
    // but we can only call public methods and access public data
    
    
    
    console.log(url.parse(req.params.url, true).path)
    console.log();
    flickr.photos.search({text: url.parse(req.params.url, true).path,
      page: Number(url.parse(req.url, true).query.offset),
      per_page: 10
    }, function(err, result) {
      if(err) { throw new Error(err); }
      
        mongo.connect(dburl, function(err, db) {
            if (err) throw err
            var col = db.collection('fcc-urlshortener')
            col.insert({searchterm:url.parse(req.params.url, true).path})
        })
      
      //console.log(result['photos']['photo']);
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.end(JSON.stringify(result['photos']['photo'].map(potato)));
    })
  });
})
// app.get("/new/:url", function(req, res) {res.end("Hello, " + req.params.url + ".");})

var port = process.env.PORT || 8080;  
app.listen(port, function() {console.log('Node.js listening/ on port ' + port);})


function potato(pot){
  console.log(pot);
  return {url:'https://www.flickr.com/photos/' + pot.owner + '/' + pot.id + '/',title:pot.title}
}