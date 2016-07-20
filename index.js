require('longjohn');

// load the mysql library
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


redditAPI.getSinglePost(2, function(err, res){ //make sure you put a postId parameter in before function when you call
  if (err){
    console.log(err);
  }
  else {
    console.log(res);
  }
})


// redditAPI.getAllPostsForUser(function (err, res){
//   if (err){
//     console.log(err);
//   }
//   else {
//     console.log(res);
//   }
// })


// redditAPI.getAllPosts(function (err, res){
//   if (err){
//     console.log(err);
//   }
//   else {
//     console.log(res);
//   }
// })

// It's request time!
// redditAPI.createUser({
//   username: 'hello25',
//   password: 'xxx'
// }, function(err, user) {
//   if (err) {
//     console.log(err);
//   }
//   else {
//     redditAPI.createPost({
//       title: 'hi reddit!',
//       url: 'https://www.reddit.com',
//       userId: user.id
//     }, function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//       }
//     });
//   }
// });