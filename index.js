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

var vote = {
  postId : 12,
  userId : 8,
  vote : 1
};

function createOrUpdateVote(vote){
  redditAPI.createOrUpdateVote (vote, function (err, res){
    if (err) {
      console.log(err);
    }
    else {
      console.log(res);
    }
  });  
}

// createOrUpdateVote(vote);



function getAllSubreddits() {

  redditAPI.getAllSubreddits (function (err, res){
    if (err) {
      console.log(err);
    }
    else {
      console.log(res);
    }
  });
  
}

//getAllSubreddits();



// var objTest = {
//   name: 'Lothar',
//   description: 'retired'
// }

// redditAPI.createSubreddit(objTest, function(err, res){
//   if (err){
//     console.log(err);
//   }
//   else {
//     console.log(res);
//   }
// })

// redditAPI.getSinglePost( function(err, res){ //make sure you put a postId parameter in before function when you call
//   if (err){
//     console.log(err);
//   }
//   else {
//     console.log(res);
//   }
// })


// redditAPI.getAllPostsForUser(function (err, res){
//   if (err){
//     console.log(err);
//   }
//   else {
//     console.log(res);
//   }
// })

function getAllPosts(){
redditAPI.getAllPosts(function (err, res){
  if (err){
    console.log(err);
  }
  else {
    console.log(res);
  }
});
}

getAllPosts();


// It's request time!
// redditAPI.createUser({
//   username: 'hello9000',
//   password: 'xx'
// }, function(err, user) {
//   // console.log(user);
//   if (err) {
//     console.log(err);
//   }
//   else {
//     redditAPI.createPost({
//       title: 'hi reddits!',
//       url: 'https://www.reddits.com',
//       userId: user.id
//     },5, 
//     function(err, post) {
//       if (err) {
//         console.log(err);
//       }
//       else {
//         console.log(post);
//       }
//     });
    
//   }
// });

function createPost (){
  redditAPI.createPost({
    title:'HiHi',
    url:'www.reddit.com',
    userId: 8
  },2,
  function(err, post){
    if(err){
      console.log(err);
    }
    else {
      console.log(post);
    }
  })
};

// createPost();