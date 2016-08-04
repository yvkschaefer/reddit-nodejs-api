//protocol + host: https://july-20-reddit-nodejs-yvkschaefer.c9users.io

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var  engine = require('ejs-mate');

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
// use ejs-locals for all ejs templates: 
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ //says every request that comes in through my express server, before going to the fn, it's going to go through another fn that's going to pre-process my request. helps me get more interesting request obj. this one parses the body.
  extended: false
}));
app.use(cookieParser()); //this middleware will add a `cookies` property to the request, an object of key:value pairs for all the cookies we set

app.use('/files', express.static(__dirname + '/static'));
app.use(checkLoginToken);



app.get('/signup', function(request, response) {
  response.render('signup.ejs', {title: 'signup'});
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

app.get('/login', function(request, response) {
  response.render('login.ejs', {title: 'login'});
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

app.get('/', function(request , response) {
  redditAPI.getAllPosts(request.query.sort, function(err, posts) {
    if (err) {
      console.log(err);
      response.status(500).send('an error occured, please try again later!');
      //response.redirect('/error.ejs');
    }
    else {
      response.render('homepage.ejs', {title: 'reddit: the front page of weeks four and five', posts: posts});
    }
  });
});

app.post('/vote', function(request, response) {
  console.log('vote postId', request.body.postId);
  if (request.loggedInUser) {
    var vote = {
      postId: parseInt(request.body.postId),
      vote: parseInt(request.body.vote)
    };
    var userId = request.loggedInUser.userId;
    redditAPI.createOrUpdateVote(vote, userId, function(err, newVote) {
      if (err) {
        console.log(err.stack);
        response.status(500).send('an error occured, please try again later!');
        response.redirect('/error.ejs');
      }
      else {
        console.log(newVote);
        response.redirect('/');
      }
    });
  }
  else {
    response.redirect('/login');
  }
});

app.get('/createPost', function(request, response) {
  response.render('createpost.ejs', {title: 'create a post'});
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

app.post('/logout', function(request, response) {
  redditAPI.deleteCookiesFromSession(request.loggedInUser.userId, function(err, result) {
    if (err) {
      console.log(err);
      response.status(500).send('could not reach cookies');
    }
    else {
      response.clearCookie('SESSION');
      response.redirect('/');
    }
  });
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



var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
