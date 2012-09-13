
/**
 * "Barrier Busters"
 * Installation for the OCADU Incluside Design institute
 * Designed and developed by Relay Studio
 * http://relaystudio.ca
 *
 * Super simple server to handle feedback requests and log errors
 */

var express = require('express'),
    fs = require('fs');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.get('/filelist', function(req, res){
  var contents = fs.readdirSync('/public/res/')
  console.log(JSON.stringify(contents));
  res.xhr(contents);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
