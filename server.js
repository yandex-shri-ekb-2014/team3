var public_path = __dirname + '/public',
    express = require('express'),
    app = express();

app.use(express.static(public_path));
app.set('views', public_path + '/jade');
app.set('view engine', 'jade');

// Роуты для отдачи целых страниц
// Полная страница "Кратко"
app.get('/', function(req, res){
    res.render('index', { type : 'short' });
});
app.get('/short', function(req, res){
    res.render('index', { type : 'short' });
});

// Полная страница "Подробно"
app.get('/full', function(req, res){
  res.render('index', { type : 'full' });
});

// Полная страница "Наглядно"
app.get('/hours', function(req, res){
    res.render('index', { type : 'hours' });
});

// Роуты для отдачи блоков страниц
// Отдаём только блок "Кратко"
app.get('/b-short', function(req, res){
    res.render('blocks', { type : 'short' });
});

// Отдаём только блок "Подробно"
app.get('/b-full', function(req, res){
    res.render('blocks', { type : 'full' });
});

// Отдаём только блок "Наглядно"
app.get('/b-hours', function(req, res){
    res.render('blocks', { type : 'hours' });
});

// 404
app.get('*', function(req, res){
    res.render('404');
});

// Cлушаем сервер на 5400 порту
app.listen(5400);
console.log('Express app started on port %d', 5400);
