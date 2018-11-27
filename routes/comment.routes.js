const express = require('express');
const router = express.Router();
const mongoose = require("../db/mongoose")

router.post('/:id', (req, res) => {
  if (req.params["id"] && req.body.username && req.body.content) {
    mongoose.User.findOne({ username: req.body.username }, (err, user) => {
      if (err) return console.error(err);
      if (user) {
        mongoose.Thread.findOne({ _id: req.params["id"] }, (err, thread) => {
          if (err) return console.error(err);
          if (thread) {
            var comment = new mongoose.Comment({ user: user._id, content: req.body.content })
            comment.save(() => {
              thread.comments.push(comment);
              thread.save(() => {
                res.send(comment);
              });
            });
          } else {
            mongoose.Comment.findOne({ _id: req.params["id"] }, (err, comment) => {
              if (err) return console.error(err);
              if (comment) {
                var newComment = new mongoose.Comment({ user: user._id, content: req.body.content })
                newComment.save(() => {
                  comment.comments.push(newComment);
                  comment.save(() => {
                    res.send(newComment);
                  });
                });
              } else {
                res.send(422);
              }
            });
          }
        });
      } else {
        res.send(404);
      }
    });
  } else {
    res.send("Wrong post body");
  }
});

router.delete("/:id", (req, res) => {
  mongoose.Comment.findOne({ _id: req.params["id"] }).populate("comments").exec((err, comment) => {
    if (err) return console.error(err);
    if (comment) {
      comment.remove(() => {
        comment.comments.forEach(comment => {
          comment.remove();
        });
        res.send(comment);
      });
    } else {
      res.send(422);
    }
  });
});

router.post('/upvote/:id', (req, res) => {
  mongoose.User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return console.error(err);
    if (user) {
      mongoose.Comment.findById(req.params['id'], (err, comment) => {
        if (err) return console.error(err);
        if (comment) {
          comment.upvotes.push(user._id);
          comment.downvotes.remove(user._id);
          comment.save(() => {
            res.send(comment);
          });
        } else {
          res.send(422);
        }
      });
    } else {
      res.send(404);
    }
  });
});

router.post('/downvote/:id', (req, res) => {
  mongoose.User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return console.error(err);
    if (user) {
      mongoose.Comment.findById(req.params['id'], (err, comment) => {
        if (err) return console.error(err);
        if (comment) {
          comment.downvotes.push(user._id);
          comment.upvotes.remove(user._id);
          comment.save(() => {
            res.send(comment);
          });
        } else {
          res.send(422);
        }
      });
    } else {
      res.send(404);
    }
  });
});

module.exports = router;