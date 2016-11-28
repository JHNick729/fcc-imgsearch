var ngis = require('node-google-image-search');

var results = ngis(['moana'], callback, 0, 5);
 
function callback(results) {
    console.log(results)
}

/*
var fs = require('fs');
var giSearch = require('google-image-search');
giSearch('logo google').pipe(fs.createWriteStream('google.jpg'));
*/