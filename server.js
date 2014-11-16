var public_path = __dirname + '/public';

var express = require('express');

var app = express();
app.use(express.static(public_path));

app.set('views', public_path + '/jade');
app.set('view engine', 'jade');

function User(name, email) {
  this.name = name;
  this.email = email;
}

// Dummy users
var users = [
    new User('tj', 'tj@vision-media.ca')
  , new User('ciaran', 'ciaranj@gmail.com')
  , new User('aaron', 'aaron.heckmann+github@gmail.com')
];

// Routes
app.get('/', function(req, res){
    res.render('index', { type : 'short' });
});

app.get('/:type', function(req, res){
  res.render('index', { type : req.params.type });
});

app.listen(5400);
console.log('Express app started on port %d', 5400);
