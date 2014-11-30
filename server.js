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
    res.sendFile(publicPath + '/html/index.html');
});

// Cлушаем сервер на 5400 порту
var port = process.env.PORT || 5400;
app.listen(port);

console.log('Express app started on port %d', port);
