var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
const saltRounds = 10;
var secureRandom = require('secure-random');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var moment = require('moment');




module.exports = function RedditAPI(conn) { //the conn that you pass here must be a valid mysql connection
  return {
    createSessionToken: function() {
      return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
    },
    
    createSession: function(userId, callback) {
      var token = this.createSessionToken();

      conn.query(`
      INSERT INTO sessions SET userId = ?, token = ?, createdAt = ?
      `, [userId, token, new Date()], function(err, result) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, token); //this is the secret session token
        }
      });
    },
    
    createUser: function(user, callback) {

      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO users (username, password, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [user.username, hashedPassword, new Date(), new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller. the caller is the callback fn
                      */
                      callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    
    createPost: function(post, userId, callback) { //this somehow needs to take user from checkLoginToken and then, (94)
      //console.log(post);
      conn.query(
        `INSERT INTO posts (userId, title, url, createdAt, updatedAt, subredditId) 
        VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, post.title, post.url, new Date(), new Date(), post.subredditId],//cont 89, instead of post.userId, I need user.userId
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              `SELECT id,title,url,userId, createdAt, updatedAt, subredditId 
              FROM posts 
              WHERE id = ?
              `, [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    
    createPostFromForm: function(form, callback) {
      conn.query(`
      INSERT INTO posts(userId, title, url, createdAt, updatedAt, subredditId)
      VALUES(?, ?, ?, ?, ?, ?)
      `, [22, form.title, form.url, new Date(), new Date(), 2],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            conn.query(`
          SELECT id,title,url,userId, createdAt, updatedAt, subredditId 
              FROM posts 
              WHERE id = ?
              `, [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    
    getAllPosts: function(sortingMethod, options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var sortMethod;
      if (sortingMethod === 'top') {
        sortMethod = 'postVoteSum';
      }
      else if (sortingMethod === 'new'){
        sortMethod = 'postCreatedAt';
      }
      else if (sortingMethod === 'controversial'){
        sortMethod = 'contra';
      }
      else {
        //this is hot or default
        sortMethod = 'postHotness';
      }

      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
        SELECT 
          p.id as postId, p.title, p.url, p.createdAt as postCreatedAt, p.updatedAt as postUpdatedAt, 
          u.id as userId, u.username, u.createdAt as userCreatedAt, u.updatedAt as userUpdatedAt,
          s.id as subredditId, s.name as subredditName, s.description as subredditDescription, s.createdAt as subredditCreatedAt, s.updatedAt as subredditUpdatedAt,
          sum(v.vote) AS postVoteSum,
          (sum(v.vote) / (NOW() - p.createdAt)) AS postHotness,
          (if((count(if(vote=1, 1, null))>count(if(vote=-1, 1, null))),(sum(vote) * count(if(vote=1, 1, null))) / count(if(vote=-1, 1, null)),null)) as contra
          
        FROM posts as p
        JOIN users as u ON p.userId=u.id
        JOIN subreddits as s ON p.subredditId=s.id
        LEFT OUTER JOIN votes as v ON p.id=v.postId
        GROUP BY postId
        ORDER BY ?? DESC
        LIMIT ? OFFSET ?`, [sortMethod, limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            var mappedData = results.map(function(obj) {
              obj.fromNow = moment(obj.postCreatedAt).fromNow();
              return {
                postId: obj.postId,
                title: obj.title,
                url: obj.url,
                fromNow: obj.fromNow,
                updatedAt: obj.postUpdatedAt,
                user: {
                  id: obj.userId,
                  username: obj.username,
                  createdAt: obj.userCreatedAt,
                  updatedAt: obj.userUpdatedAt
                },
                subreddits: {
                  id: obj.subredditId,
                  name: obj.subredditName,
                  description: obj.subredditDescription,
                  createdAt: obj.subredditCreatedAt,
                  updatedAt: obj.subredditUpdatedAt
                },
                voteScore: obj.postVoteSum,
                voteHotness: obj.postHotness
              };
            });
            //console.log(mappedData.length);
            callback(null, mappedData);
          }
        }
      );
    },
    
    getPosts: function (callback){
      conn.query(`
      SELECT * FROM posts
      ORDER BY createdAt
      LIMIT 25;
      `, function (err, posts){
        if (err){
          callback (err);
        }
        else {
          callback (null, posts);
        }
      });
    },
    
    getAllPostsForUser: function(userId, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
        SELECT * 
        FROM posts 
        WHERE posts.userId = ?
        LIMIT ? OFFSET ?`, [userId, limit, offset], //this line comes back to ? explanation from Ziad's notes.
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },
    
    getFiveLatestPosts: function(userId, callback) {
      conn.query(`
        SELECT *
        FROM posts
        WHERE userId = ?
        ORDER BY createdAt DESC
        LIMIT 5;
      `, [userId],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },
    
    getSinglePost: function(userId, callback) {
      conn.query(`
      SELECT *
      FROM posts
      WHERE id = ?`, [userId], //these commas are actually crazy important. They go between the separate arguments
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },
    
    createSubreddit: function(subreddit, callback) {
      conn.query(`
      INSERT INTO subreddits (name, description, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?)
      `, [subreddit.name, subreddit.description, new Date(), new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            conn.query(
              `SELECT name, description
            FROM subreddits
            WHERE id=?
            `, [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    
    getAllSubreddits: function(callback) {
      conn.query(`
      SELECT * FROM subreddits
      ORDER BY createdAt DESC
      `,
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, result);
          }
        }
      );
    },
    
    createOrUpdateVote: function(vote, userId, callback) {
      if (vote.vote === -1 || vote.vote === 0 || vote.vote === 1) {

        conn.query(`
        INSERT INTO votes (postId, userId, vote, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE vote= ?
        `, [vote.postId, userId, vote.vote, new Date(), new Date(), vote.vote],
          function(err, result) {
            if (err) {
              callback(err);
            }
            else {
              conn.query(`
            SELECT * FROM votes
            `, function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result);
                }
              });
            }
          }
        );
      }
      else {
        callback(null, 'oops, the vote should be either -1 to downvote, 1 to upvote, or 0 to cancel a vote');
      }
    },
    
    newUser: function(username, password, callback) {
      conn.query(`
      SELECT * FROM users
      WHERE username = ?
      `, [username], function(err, result) {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            callback(new Error('username or password incorrect'));
          }
          else {
            callback(err);
          }
        }
        else { //username is not taken, so, let's add them to our system!
          //hash password first
          bcrypt.hash(password, saltRounds, function(err, hashedPassword) {
            if (err) {
              callback(err);
            }
            else {
              conn.query(`
              INSERT INTO users (username, password, createdAt, updatedAt)
              VALUES (?, ?, ?, ?)
              `, [username, hashedPassword, new Date(), new Date()],
                function(err, result) {
                  if (err) {
                    callback(err);
                  }
                  else {
                    callback(null, result[0]);
                  }
                });
            }
          });
        }
      });
    },
    
    checkLogin: function(username, password, callback) {
      conn.query(`
      SELECT * FROM users WHERE username = ?
      `, [username], function(err, result) {
        if (err) {
          console.log(err.stack);
          callback(err);
        }
        else if (result.length === 0) { //if this, means that username is not in the system
          callback(new Error(`
          username or password incorrect. 
          please <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/login">try again</a> 
          or sign up <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/signup">here</a>
          `));
        }
        else {
          var user = result[0];
          var actualHashedPassword = user.password; 
          bcrypt.compare(password, actualHashedPassword, function(err, result) {
            if (err) {
              console.log(err.stack);
              callback(err);
            }
            else if (result === true) {
              callback(null, user);
            }
            else {
              callback(new Error('username or password incorrect'));
            }
          });
        }
      });
    },
    
    getUserSession: function(token, callback) { //when the user logs in, previously... set a cookie with the value userId, then when call isLoggedIn
      conn.query(`
      SELECT * FROM sessions
      WHERE token = ?
      `, [token], function(err, session) {
        if (err) {
          console.log(err.stack);
          callback(err);
        }
        else if (session.length === 0) {
          callback(new Error(`
            you must be logged in to do this.
            please <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/login">login</a> 
            or sign up <a href="https://july-20-reddit-nodejs-yvkschaefer.c9users.io/signup">here</a>
            `));
        }
        else {
          //they're logged in. so... proceed.
          //console.log('session from getUserSession fn ', session)
          callback(null, session);
        }
      });
    },
    
    getUserFromSession: function(sessionCookie, callback) {
      conn.query(`
      SELECT * FROM sessions
      WHERE token = ?
      `, [sessionCookie], function(err, userObj) {
        if (err) {
          console.log(err.stack);
          callback(err);
        }
        else {
          callback(null, userObj[0]);
        }
      });
    },
    
    deleteCookiesFromSession: function(userId, callback){
      if(userId){
        conn.query(`
        DELETE FROM sessions 
        WHERE userId = ?
        `,[userId], function(err, result) {
            if(err){
              console.log(err.stack);
              callback(err);
            }
            else {
              callback(null, result);
            }
        });
      }
    }
  };
};