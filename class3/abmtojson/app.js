const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const mongojs = require('mongojs');
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const db = mongojs('mongodb://localhost/cursodb', ['alumnos']);
let counter = 0;
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'default'}) );
app.set('view engine', '.hbs');

app.use( express.static('./public') );
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/counter', (req, res)=> res.end('counter: '+counter++));
app.get('/datetime', (req, res)=> res.end(new Date().toString));
app.get('/', (req, res)=> {
  db.alumnos.find({}, {})
  .limit(1000)
  .toArray( (err, docs)=>{
    res.render('home', {alumnos: docs});
  });

});

app.get('/alumno/:_id', (req, res)=>{
  db.alumnos.findOne( {_id: db.ObjectId(req.params._id)}, {}, (err, doc)=>{
    res.render('profile', {alumno:  doc});
  });
});

app.get('/add', (req, res)=>{
  res.render('add', {action:'save',
  btnlabel: 'Add+'});
});

app.post('/save', (req, res)=>{
  req.query.added = new Date();
  db.alumnos.insert(req.body, (err, doc)=>{
    res.redirect('/');
  });
});

app.get('/filter', (req, res)=>{
  db.alumnos.find({prom: req.query.prom}, {}, (err, docs)=>{
    res.render('home', {alumnos: docs});
  });
});

app.get('/delete', (req, res)=>{
  db.alumnos.remove({_id: db.ObjectId(req.query._id)}, (err, doc)=>{
    res.redirect('/');
  });
});

app.get('/edit/:_id', (req, res)=>{
  db.alumnos.findOne({_id: db.ObjectId(req.params._id)}, (err, doc)=>{
    console.log('alumno: ', doc)
    res.render('add', {alumno: doc,
      action:'update',
      btnlabel: 'Update'
    });
  })
});

app.post('/update/:_id', (req, res)=>{
  db.alumnos.update({_id: db.ObjectId(req.params._id)}, {$set:req.body}, (err, doc)=>{
    res.redirect('/');
  });
});

console.log('listen');
server.listen(5000);
