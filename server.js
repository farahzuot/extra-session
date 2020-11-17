'use strict';

//APP related
const express = require('express');
const cors = require('cors');
//API related
const superagent = require('superagent');
//rendering
//const ejs = require('ejs');
//database related
require('dotenv').config();
const pg = require('pg');
const { send } = require('process');
const methodOverride = require('method-override');

const client = new pg.Client(process.env.DATABASE_URL);

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

//end-points
app.get('/home', homeFunc);
app.post('/facts', addToFav);
app.get('/facts', readFromFav);
app.get('/details/:factId', viewDetails);
app.put('/details/:factId', updateDetails);
app.delete('/details/:factId', deleteFact);

//constructor
function Fact(obj) {
  this.type = obj.type;
  this.text = obj.text;
}
//functions
function homeFunc(req, res) {
  const url = 'https://cat-fact.herokuapp.com/facts'
  let factArr = [];
  superagent.get(url).then(data => {
    data.body.all.forEach(element => {
      factArr.push(new Fact(element))
    });
    res.render('home', { result: factArr });
  })
}

function addToFav(req,res){
  //res.send(req.body);
  const sql = 'INSERT INTO fact(type,text) VALUES ($1,$2)'
  const safeValues=[req.body.type,req.body.text]
  client.query(sql,safeValues).then(data=>{
    res.redirect('/facts');
  })
}

function readFromFav(req,res){
  const read = 'SELECT * FROM fact;';
  client.query(read).then(data=>{
    res.render('result', {result: data.rows});
  })
}

function viewDetails(req,res){
  //console.log(req.body)
  const sql = 'SELECT * FROM fact where id=$1';
  const idValue = [req.params.factId];

  client.query(sql,idValue).then(data=>{
    //console.log(data.rows)
    res.render('details', {result: data.rows[0]});
  })
}

function updateDetails(req,res){

  const sql = 'UPDATE fact SET type = $1 , text = $2 where id = $3'
  const values = [req.body.type, req.body.text, req.params.factId]
  console.log(req.body)
  client.query(sql,values).then(()=>{
    res.redirect('/facts')
  })
}

function deleteFact(req,res){
  //res.send(req.body)
  const sql = 'DELETE FROM fact where id = $1'
  const value = [req.params.factId]
  client.query(sql,value).then(()=>{
    res.redirect('/facts')
  })
}

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`listening to ${PORT}`)
  });
});