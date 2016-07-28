//protocol + host: https://july-20-reddit-nodejs-yvkschaefer.c9users.io

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');

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
app.use(cookieParser()); //this middleware will add a `cookies` property to the request, an object of key:value pairs for all the cookies we set


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
    <div>
      <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/">homepage</a>
    </div>
  `;
  response.send(signupForm);
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
  var loginForm = `
<form action='/login' method='POST'>
  <div>
    <input type='text' name='username' placeholder='Enter your username here'>
  </div>
  <div>
    <input type='text' name='password' placeholder='Enter your password here'>
  </div>
  <button type='submit'>Login!</button>
  <div>
    don't have an account? sign-up <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/signup">here</a>
  </div>
  <div>
    <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/">homepage</a>
  </div>
</form>
`;
  //console.log(request.body);
  response.send(loginForm);
});

app.post('/login', function(request, response) {
  //console.log(request.body);
  redditAPI.checkLogin(request.body.username, request.body.password, function(err, user) {
   // console.log(user);
    if (err) {
      //console.log(request.body.username);
      //console.log(request.body.password);
      response.status(401).send(err.message);
    }
    else {
      //password is OK!
      //we have to create a token and send it to the user in his cookies, then add it to our sessions table!

      //console.log('Is this working?');
      redditAPI.createSession(user.id, function(err, token) { //used to say user.id and it worked
        if (err) {
          response.status(500).send('an error occured. please try again later!');
        }
        else {
          //console.log(user.id);
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
				<td>Top</td>
				<td>Hot</td>
				<td>New</td>
				<td>Controversial</td>
		</tbody>
	  </table>
	  <table>
	  <thead>
  	</thead>
	  <tbody>
	    <td><a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/createPost">Create Post</a></td>
</body>
</html>`;
  response.send(homepage);
});

app.get('/createPost', function(request, response) {
  var createPost = `
     <!DOCTYPE html>
     <html>
       <head>
         <title>create a post</title>
       </head>
       <body>
        <form action="/createPost" method="POST">
          <div>
            <input type="text" name="url" placeholder="Enter a URL for your post">
          </div>
          <div>
            <input type="text" name="title" placeholder="Enter the title of your post">
          </div>
            <button type="submit">Create!</button>
        </form>
         <div>
           <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/">homepage</a>
         </div>
       </body>
     </html>
     `;
  response.send(createPost);
});

app.post('/createPost', function(request, response) {
  //console.log(request.cookies.SESSION);
  redditAPI.getUserSession(request.cookies.SESSION, function(err, session) {
    if (err) {
      response.send(err.toString());
    }
    else {
      console.log('url: ' + request.body.url + ' title: ' + request.body.title);
      redditAPI.createPost(request.body, function(err, result) {
        if (err) {
          console.log(err.stack);
          response.status(500).send('an error occured. please try again later!');
        }
        else {
          response.redirect('/');
        }
      });
    }
  });
});


function checkLoginToken(request, response, next) {
  // console.log('Request.cookies.SESSION: ' + request.cookies.SESSION);

  if (request.cookies.SESSION) {
    redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user) {
      if (err) {
        response.send(err.toString());
      }
      else if (user) {
        request.loggedInUser = user;
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

//app.use(checkLoginToken);


var server = app.listen(process.env.PORT, process.env.IP, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
