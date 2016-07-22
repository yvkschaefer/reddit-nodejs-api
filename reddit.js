var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

module.exports = function RedditAPI(conn) { //the conn that you pass here must be a valid mysql connection
  return {
    createUser: function(user, callback) {

      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO users (username,password, createdAt, updatedAt) VALUES (?, ?, ?, ?)', [user.username, hashedPassword, new Date(), new Date()],
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
    createPost: function(post, subredditId, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, createdAt, updatedAt, subredditId) VALUES (?, ?, ?, ?, ?, ?)', [post.userId, post.title, post.url, new Date(), new Date(), subredditId],
        function(err, result) {
          console.log("HELLO", subredditId);
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT id,title,url,userId, createdAt, updatedAt, subredditId FROM posts WHERE id = ?', [result.insertId],
              function(err, result) {
                //console.log("HELLO", result);

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


    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
        SELECT 
          p.id as postId, p.title, p.url, p.createdAt as postCreatedAt, p.updatedAt as postUpdatedAt, 
          u.id as userId, u.username, u.createdAt as userCreatedAt, u.updatedAt as userUpdatedAt,
          s.id as subredditId, s.name as subredditName, s.description as subredditDescription, s.createdAt as subredditCreatedAt, s.updatedAt as subredditUpdatedAt,
          sum(v.vote) as voteScore
          
        FROM posts as p
        JOIN users as u ON p.userId=u.id
        JOIN subreddits as s ON p.subredditId=s.id
        JOIN votes as v ON p.id=v.postId
        GROUP BY postId
        ORDER BY postCreatedAt DESC
        LIMIT ? OFFSET ?`, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            var mappedData = results.map(function(obj) {
              return {
                postId: obj.postId,
                title: obj.title,
                url: obj.url,
                createdAt: obj.postCreatedAt,
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
                voteScore: obj.voteScore
              };
            });
            callback(null, mappedData);
          }
        }
      );
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
      INSERT INTO subreddits (name, description, createdAt) 
      VALUES (?, ?, ?)
      `, [subreddit.name, subreddit.description, new Date()],
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
            )
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
    createOrUpdateVote: function(vote, callback) {
      if (vote.vote === -1 || vote.vote === 0 || vote.vote === 1) {
        //callback(null, "works well")

        conn.query(`
        INSERT INTO votes (postId, userId, vote, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE vote= ?
        `, [vote.postId, vote.userId, vote.vote, new Date(), new Date(), vote.vote],
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
              })
            }
          }
        )
      }
      else {
        callback(null, 'oops, the vote should be either -1 to downvote, 1 to upvote, or 0 to cancel a vote');
      }
    }
  };
};