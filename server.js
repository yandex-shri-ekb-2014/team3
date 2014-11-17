var public_path = __dirname + '/public',
    express = require('express'),
    app = express();

app.use(express.static(public_path));
app.set('views', public_path + '/jade');
app.set('view engine', 'jade');

// Routes
app.get('/', function(req, res){
    res.render('index', { type : 'short' });
});

app.get('/:type', function(req, res){
  res.render('index', { type : req.params.type });
});

app.listen(5400);
console.log('Express app started on port %d', 5400);
