var publicPath = __dirname + '/public',
    express = require('express'),
    app = express();

app.use(express.static(publicPath));

// Роуты для отдачи целых страниц
// Полная страница "Кратко"
app.get('/', function (req, res) {
  res.sendFile(publicPath + '/html/index.html');
});
app.get('/short', function (req, res) {
  res.sendFile(publicPath + '/html/index.html');
});

// Полная страница "Подробно"
app.get('/full', function (req, res) {
  res.sendFile(publicPath + '/html/index.html');
});

// Полная страница "Наглядно"
app.get('/hours', function (req, res) {
  res.sendFile(publicPath + '/html/index.html');
});

// 404
app.get('*', function (req, res) {
  res.sendFile(publicPath + '/html/404.html');
});

// Cлушаем сервер на 5400 порту
app.listen(5400);
console.log('Express app started on port %d', 5400);
