const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fileUpload = require('express-fileupload');
const multer = require('multer');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Parsing middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true})); 

// Pass applicaion/json
app.use(bodyParser.json());

// File Upload
app.use(fileUpload());

app.use(express.json());
app.use(express.urlencoded());

// Static Files
//app.use(express.static('public'));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + '/upload'));
//app.use('/public', express.static(path.join(__dirname, "public")));

// Templateing Engine
app.engine('hbs', exphbs({extname: '.hbs' }));
app.set('view engine', 'hbs');

// // Connection Pool
// const pool = mysql.createPool({
//     connectionLimit : 100,
//     host            : process.env.DB_HOST,
//     user            : process.env.DB_USER,
//     password        : process.env.PASS,
//     databse         : process.env.DB_NAME
// });

// // Connect to DB
// pool.getConnection((err, connection)=>{
//     if(err) throw err; // not connected
//     console.log('Connected as ID ' + connection.threadId);
// });

const routes = require('./server/routes/items');
app.use('/', routes);


app.listen(port, ()=> console.log(`Listening on post ${port}`));