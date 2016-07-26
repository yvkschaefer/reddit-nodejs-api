var express = require('express');
var bodyParser = require('body-parser');


require('longjohn');
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'yvkschaefer',
  password : '',
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


//okay let's do some signing up. give the user a form, sign em up

app.get('/signup', function (request, response){
  var signupForm = `
  <form action='/signup' method='POST'>
    <div>
      <input type='text' name='username' placeholder='choose your own unique username!'>
    </div>
    <div>
      <input type='text' name='password' placeholder='choose a password that isn't easy to guess!'>
    </div>
    <button type='submit'>Sign Up!</button>
  `;
  response.send(signupForm);
});


app.post('/signup', function(request, response){
  //write a function in reddit.js, maybe called newUser or sthg
  
  redditAPI.createUser
})

//let's go to the login page, give the user a form, and check to see if their login works


app.get('/login', function(request, response){
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

app.post('/login', function (request, response){
  console.log(request.body);
  redditAPI.checkLogin(request.body, function (err, result){
    if (err){
      console.log(err.stack);
    }
    else {
      response.send(response.body);
    }
  });
});






var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});


