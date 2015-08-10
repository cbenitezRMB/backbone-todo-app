// importar
var express = require('express');
var open = require('open');
 
// instanciar
var app = express();
 
// ruteo
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});
app.get('/about', function(req, res){
  res.sendfile(__dirname + '/about.html');
});
app.post('/data/tasks.json', function(req, res){
  res.sendfile(__dirname + '/data/tasks.json');
});


app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/data", express.static(__dirname + '/data'));
app.use("/fonts", express.static(__dirname + '/fonts'));
 
// escuchar
app.listen(9000);

open('http://localhost:9000');
 
console.log("Servidor Express escuchando en modo %s", app.settings.env);