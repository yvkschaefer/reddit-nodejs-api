//protocol + host: https://july-20-reddit-nodejs-yvkschaefer.c9users.io

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

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

app.use(bodyParser.urlencoded({ //says every request that comes in through my express server, before going to the fn, it's going to go through another fn that's going to pre-process my request. helps me get more interesting request obj. this one parses the body.
  extended: false
}));
app.use(cookieParser());

//okay let's do some signing up. give the user a form, sign em up

app.get('/signup', function(request, response) {
  var signupForm = `
  <form action='/signup' method='POST'>
    <div>
      <input type='text' name='username' placeholder='choose your own unique username!'>
    </div>
    <div>
      <input type='text' name='password' placeholder='choose a password that isn't easy to guess!'>
    </div>
    <button type='submit'>Sign Up!</button>
    <div>
    already signed up? login <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/login">here</a>
    </div>
  `;
  response.send(signupForm);
});


app.post('/signup', function(request, response) {
  console.log(request.body);
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
  var loginForm = `
<form action='/login' method='POST'>
  <div>
    <input type='text' name='username' placeholder='Enter your username here'>
  </div>
  <div>
    <input type='text' name='password' placeholder='Enter your password here'>
  </div>
  <button type='submit'>Login!</button>
</form>
`;
  console.log(request.body);
  response.send(loginForm);
});

app.post('/login', function(request, response) {
  //console.log(request.body);
  redditAPI.checkLogin(request.body.username, request.body.password, function(err, user) {
    if (err) {
      //console.log(request.body.username);
      //console.log(request.body.password);
      response.status(401).send(err.message);
    }
    else {
      //password is OK!
      //we have to create a token and send it to the user in his cookies, then add it to our sessions table!

      //console.log('Is this working?');
      redditAPI.createSession(user.id, function(err, token) {
        if (err) {
          response.status(500).send('an error occured. please try again later!');
        }
        else {
          response.cookie('SESSION', token); //the secret token is now in the user's cookies!
          response.redirect('/');
        }
      });
    }
  });
});

//homepage

app.get('/', function(request, response) {
  var homepage = `<!DOCTYPE html>
<html>
<head>
<link type="text/css" rel="stylesheet" href="Styles/karastylesheet.css"/>
<title>reddit: the front page of week four</title>
</head>
<body style="background-color:lightgrey"
	<table>
		<thead>
		</thead>	
		<tbody>
				<td><a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/login">Login</a></td>
				<td><a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/signup">Register</a></td>
		</tbody>
	</table>
		<table>
		<thead>
		</thead>
		<tbody>
				<td><a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/top">Top</a></td>
				<td><a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/hot">Hot</a></td>
				<td><a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/newest">New</a></td>
				<td><a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/controversial">Controversial</a></td>
		</tbody>
	  </table>
	  <table>
	  <thead>
  	</thead>
	  <tbody>
	    <td>Create Post</td>
</body>
</html>`;
  response.send(homepage);
});


//'hot' page. this actually will be the same as the homepage.
app.get('/hot', function(request, response) {
  var hot = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>reddit: the front page of week four</title>
      </head>
      <body>
        <div>
          <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/">homepage</a>
        </div>
      </body>
    </html>
    `;
  response.send(hot);
});

app.get('/top', function(request, response) {
  var top = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>top scoring links</title>
      </head>
      <body>
        <div>
          <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/">homepage</a>
        </div>
      </body>
    </html>
    `;
  response.send(top);
});

app.get('/newest', function(request, response) {
  var newest = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>newest submissions</title>
      </head>
      <body>
        <div>
          <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/">homepage</a>
        </div>
      </body>
    </html>
    `;
  response.send(newest);
});

app.get('/controversial', function(request, response) {
  var controversial = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>most controversial links</title>
      </head>
      <body>
        <div>
          <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/">homepage</a>
        </div>
      </body>
    </html>
    `;
  response.send(controversial);
});

var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
