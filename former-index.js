
// var vote = {
//   postId : 12,
//   userId : 8,
//   vote : 1
// };

// function createOrUpdateVote(vote){
//   redditAPI.createOrUpdateVote (vote, function (err, res){
//     if (err) {
//       console.log(err);
//     }
//     else {
//       console.log(res);
//     }
//   });  
// }

// createOrUpdateVote(vote);



// function getAllSubreddits() {

//   redditAPI.getAllSubreddits (function (err, res){
//     if (err) {
//       console.log(err);
//     }
//     else {
//       console.log(res);
//     }
//   });
  
// }

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

// function getAllPosts(sort){
// redditAPI.getAllPosts(sort, function (err, res){
//   if (err){
//     console.log(err);
//   }
//   else {
//     console.log(res);
//   }
// });
// }

// //getAllPosts('top');


// // It's request time!

// function createUser(){

// redditAPI.createUser({
//   username: 'John Smith',
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
//     },2, 
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
// }
// // createUser();

// function createPost (){
//   redditAPI.createPost({
//     title:'Mercury',
//     url:'www.mercury.com',
//     userId: 22
//   },2,
//   function(err, post){
//     if(err){
//       console.log(err);
//     }
//     else {
//       console.log(post);
//     }
//   })
// };

// //createPost();


// function getFiveLatestPosts(userId, callback){
//   redditAPI.getFiveLatestPosts(userId, function(err, res){
//     if (err){
//       console.log(err);
//     }
//     else {
//       console.log(res);
//     }
//   });
// }

// getFiveLatestPosts(22);