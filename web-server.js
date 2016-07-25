var express = require('express');
var mysql = require('mysql');

var app = express();
var bodyParser = require('body-parser');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'yvkschaefer',
    password: '',
    database: 'reddit'
});

var reddit = require('./reddit');
var redditAPI = reddit(connection);

// parse application/x-www-form-urlencoded
//https://github.com/expressjs/body-parser#bodyparserurlencodedoptions
app.use(bodyParser.urlencoded({
    extended: false
}));

//https://july-20-reddit-nodejs-yvkschaefer.c9users.io

//Exercise 1: Getting started!

//Create a web server that can listen to requests for /hello, and respond with some HTML that 
//says <h1>Hello World!</h1>

// app.get('/hello', function (request, response){
//     console.log('I received a request!');
//     response.send('<h1>Hello World!</h1>');
// });

//Exercise 2: A wild parameter has appeared!

//Create a web server that can listen to requests for /hello?name=firstName, and respond with 
//some HTML that says <h1>Hello _name_!</h1>. For example, if a client requests /hello/John, the 
//server should respond with <h1>Hello John!</h1>.

// app.get('/hello', function(request, response) {
//     console.log(request.query);

//     var firstName = request.query.name;
//     response.send('<h1>Hello ' + firstName + '!</h1>');

// });




//Exercise 3: Operations

//Create a web server that can listen to requests for /calculator/:operation?num1=XX&num2=XX and 
//respond with a JSON object that looks like the following. For example, /op/add?num1=31&num2=11:

// app.get('/calculator/:operation', function(request, response) {
//     console.log('I received a request!');
//     var num1 = request.query.num1;
//     var num2 = request.query.num2;
//     var operation = request.params.operation;
//     var operationObj = {};



//     if (operation === 'add'){
//     operationObj.operator = 'add';
//     operationObj.firstOperand = num1;
//     operationObj.secondOperand = num2;
//     operationObj.solution = JSON.parse(num1) + JSON.parse(num2)
//     }

//     else if (operation === 'sub'){
//     operationObj.operator = 'sub';
//     operationObj.firstOperand = num1;
//     operationObj.secondOperand = num2,
//     operationObj.solution = JSON.parse(num1) - JSON.parse(num2)
//     }

//     else if (operation === 'mult'){
//     operationObj.operator = 'mult';
//     operationObj.firstOperand = num1;
//     operationObj.secondOperand = num2;
//     operationObj.solution = JSON.parse(num1) * JSON.parse(num2)
//     }

//     else if (operation === 'div'){
//     operationObj.operator = 'div';
//     operationObj.firstOperand = num1;
//     operationObj.secondOperand = num2;
//     operationObj.solution = JSON.parse(num1) / JSON.parse(num2)
//     }

//     else{
//         response.status(500).send('<h2>Broken!! :(</h2>');
//     }

//     response.send(operationObj);
// });


// app.get('/posts', function(request, response) {
//     console.log('Hey, got your request!');
//     redditAPI.getFiveLatestPosts(22, function(err, res) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             console.log(res);

//             function createLi(post){
//                 return `
//                 <li class = "content-item">
//                     <h3 class="content-item__title"><p>
//                         Post Title: ${post.title}
//                     </p>
//                     <a href= ${post.url}>${post.url}</a>
//                     <p>Created By userId: ${post.userId}</p>
//                     </h3>
//                 </li>
//                 `;
//             }

//             var html = `
//     <div id="contents">
//         <h1>List of contents</h1>
//       <ul class="contents-list">
//       ${res.map(function(post){
//           return createLi(post);
//       }).join("")}
//       </ul>
//     </div>
//     `;

//             response.send(html);
//         }
//     });

// });


var form =
    `
<form action="/createContent" method="POST">
  <div>
    <input type="text" name="url" placeholder="Enter a URL to content">
  </div>
  <div>
    <input type="text" name="title" placeholder="Enter the title of your content">
  </div>
  <button type="submit">Create!</button>
</form>
`;
app.get('/createContent', function(request, response) {
    response.send(form);
});

app.post('/createContent', function(request, response) {
    console.log(request.body);
    redditAPI.createPostFromForm(request.body, function(err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(result);
            response.send(result);
        }
     
    });

});

//Once you are familiar with the contents of req.body, use a version of your createPost MySQL 
//function to create a new post that has the URL and Title passed to you in the HTTP request. 
//For the moment, set the user as being ID#1, or "John Smith".


var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});