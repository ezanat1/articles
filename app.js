// Require Express JS
const express = require ('express');
const path = require ('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport=require('passport')
const config=require('./config/database');


mongoose.connect('mongodb://localhost/nodekb')
let db = mongoose.connection;

db.once('open',function(){
    console.log('Conencted to Mongodb')
})

//Check for DB errors
db.on('error',function(){
    console.log(error)
});

//Init app

const app = express();

let Article =require('./models/article')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

//SEt public Folder
app.use(express.static(path.join(__dirname,'public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}))

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
//Passport config
require('./config/passport')(passport);
//passport middle ware

app.use(passport.initialize());
app.use(passport.session());
//express Validator
app.use(expressValidator({
    errorFormatter:function(param,msg,value){
        var namespace = param.split('.')
        ,root = namespace.shift()
        ,formParam =  root;

        while(namespace.length){
            formParam += '[' + namespace.shift() +']';

        }
        return {
            param:formParam,
            msg:msg,
            value:value
        }
    }
}))

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug')

app.get('*',function(req,res,next){
    res.locals.user=req.user || null
    next();

})
//Routing-Home Route
app.get('/', function(req,res) {
    Article.find({},function(err,articles){
        if(err){
            console.log(err)
        }else{
            res.render('index',{
                title:'hello',
                articles:articles
            });
        }
    })
});
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles',articles);
app.use('/users',users);

//Start server
app.listen(3000,function(){
    console.log('Server Started on server 3000')
})