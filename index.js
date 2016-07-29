//protocol + host: https://july-20-reddit-nodejs-yvkschaefer.c9users.io

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var ejs = require('ejs');

require('longjohn');
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'yvkschaefer',
  password: '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit'); //'./reddit' is the same as './reddit.js'
var redditAPI = reddit(connection);

var app = express();

app.disable('x-powered-by');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ //says every request that comes in through my express server, before going to the fn, it's going to go through another fn that's going to pre-process my request. helps me get more interesting request obj. this one parses the body.
  extended: false
}));
app.use(cookieParser()); //this middleware will add a `cookies` property to the request, an object of key:value pairs for all the cookies we set

app.use('/files', express.static(__dirname + '/static'));
app.use(checkLoginToken);



app.get('/signup', function(request, response) {
  response.render('signup.ejs');
});


app.post('/signup', function(request, response) {
  //console.log(request.body);
  if (request.body.username.length < 2 || request.body.password.length < 2) {
    response.status(400).send('please make both your username and password longer than three characters');
  }
  else {
    redditAPI.newUser(request.body.username, request.body.password, function(err, result) {
      if (err) {
        console.log(err.stack);
      }
      else {
        response.redirect('/login');
      }
    });
  }
});

//let's go to the login page, give the user a form, and check to see if their login works


app.get('/login', function(request, response) {
  response.render('login.ejs');
});

app.post('/login', function(request, response) {
  redditAPI.checkLogin(request.body.username, request.body.password, function(err, user) {
    if (err) {
      response.status(401).send(err.message);
    }
    else {
      //password is OK!
      //we have to create a token and send it to the user in his cookies, then add it to our sessions table!


      redditAPI.createSession(user.id, function(err, token) { //used to say user.id and it worked
        if (err) {
          response.status(500).send('an error occured. please try again later!');
        }
        else {

          response.cookie('SESSION', token); //the secret token is now in the user's cookies! ... the token is the cookie
          response.redirect('/');
          //console.log('cookie: ' + JSON.stringify(request.cookies));
        }
      });
    }
  });
});



//homepage

app.get('/', function(request, response) {
  redditAPI.getPosts(function(err, posts) {
    if (err) {
      console.log(err);
      response.status(500).send('an error occured, please try again later!');
    }
    else {
      console.log(posts);
    response.render('homepage.ejs', {posts: posts});
    }
  });
});

//display posts, not the right way just checking to see if fn works

app.get('/posts', function(request, response){
  redditAPI.getPosts(function(err, result){
    if (err){
      console.log(err.stack);
      response.send('error, please try again later');
    }
    else {
      response.send(result);
    }
  });
});







app.get('/createPost', function(request, response) {
  response.render('createpost.ejs');
});

app.post('/createPost', function(request, response) {
  if (request.loggedInUser) {
    var userId = request.loggedInUser.userId;
    redditAPI.createPost(request.body, userId, function(err, result) {
      if (err) {
        console.log(err.stack);
        response.status(500).send('an error occured. please try again later!');
      }
      else {
        response.redirect('/');
      }
    });
  }
  else {
    response.redirect('/login');
  }
});


function checkLoginToken(request, response, next) {
  if (request.cookies.SESSION) {
    redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user) {
      if (err) {
        response.send(err.toString());
      }
      else if (user) {

        request.loggedInUser = user;


        next();
      }
      else {
        next();
      }
    });
  }
  else {
    next();
  }
}

//put my redditAPI.getAllPosts fn into my homepage.ejs file



var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
