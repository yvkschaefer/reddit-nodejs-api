var express = require('express');
var mysql = require('mysql');

var app = express();



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
function getName() {
    app.get('/hello', function(request, response) {
        console.log(request.query);

        var firstName = request.query.name;
        response.send('<h1>Hello ' + firstName + '!</h1>');

    });
}
// getName();


//Exercise 3: Operations

//Create a web server that can listen to requests for /calculator/:operation?num1=XX&num2=XX and 
//respond with a JSON object that looks like the following. For example, /op/add?num1=31&num2=11:


    app.get('/calculator/:operation', function(request, response) {
        console.log('I received a request!');
        var num1 = request.query.num1;
        var num2 = request.query.num2;
        var operation = request.params.operation;
        var operationObj = {};
        
    
        
        if (operation === 'add'){
        operationObj.operator = 'add';
        operationObj.firstOperand = num1;
        operationObj.secondOperand = num2;
        operationObj.solution = JSON.parse(num1) + JSON.parse(num2)
        }

        else if (operation === 'sub'){
        operationObj.operator = 'sub';
        operationObj.firstOperand = num1;
        operationObj.secondOperand = num2,
        operationObj.solution = JSON.parse(num1) - JSON.parse(num2)
        }

        else if (operation === 'mult'){
        operationObj.operator = 'mult';
        operationObj.firstOperand = num1;
        operationObj.secondOperand = num2;
        operationObj.solution = JSON.parse(num1) * JSON.parse(num2)
        }

        else if (operation === 'div'){
        operationObj.operator = 'div';
        operationObj.firstOperand = num1;
        operationObj.secondOperand = num2;
        operationObj.solution = JSON.parse(num1) / JSON.parse(num2)
        }
        
        else{
            response.status(500).send('<h2>Broken!! :(</h2>');
        }
        
        response.send(operationObj);
    });





/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});