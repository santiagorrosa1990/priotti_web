var express = require('express');
var FileSaver = require('file-saver');
var Blob = require('blob');
var app = express();

app.use(express.static('resources'));

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

app.get('/admin', function (req, res) {
  res.sendFile(__dirname+'/admin.html');
});

app.get('/xlsx', function (req, res) {
  res.sendFile(__dirname+'/test.html');
});

app.listen(3000, function () {
  console.log('App listening on port 3000!');
});
