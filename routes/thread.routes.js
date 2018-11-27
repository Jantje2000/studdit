const express = require('express');
const router = express.Router();
const mongoose = require("../db/mongoose")

router.get('/', (req, res) => {
  mongoose.Thread.aggregate([
    {
      "$project": {
        "username": 1,
        "title": 1,
        "content": 1,
        "upvotes": { "$size": "$upvotes" },
        "downvotes": { "$size": "$downvotes" },
      }
    }]).exec((err, results) => {
    if (err) return console.error(err);
    if (results) {
      res.send(results);
    } else {
      res.send(404);
    }
  })
});

router.get('/upvotes', (req, res) => {
  mongoose.Thread.aggregate([
    {
      "$project": {
        "username": 1,
        "title": 1,
        "content": 1,
        "upvotes": { "$size": "$upvotes" },
        "downvotes": { "$size": "$downvotes" },
      }
    },
    { "$sort": { "upvotesize": -1 } }
  ]).exec((err, results) => {
    if (err) return console.error(err);
    if (results) {
      res.send(results);
    } else {
      res.send(404);
    }
  })
});

router.get('/karma', (req, res) => {
  mongoose.Thread.aggregate([
    {
      "$project": {
        "username": 1,
        "title": 1,
        "content": 1,
        "upvotes": { "$size": "$upvotes" },
        "downvotes": { "$size": "$downvotes" },
        "karma": { "$subtract": [{ "$size": "$upvotes" }, { "$size": "$downvotes" }] }
      }
    },
    { "$sort": { "karma": -1 } }
  ]).exec((err, results) => {
    if (err) return console.error(err);
    if (results) {
      res.send(results);
    } else {
      res.send(404);
    }
  })
});

router.get('/comments', (req, res) => {
  mongoose.Thread.aggregate([
    {"$graphLookup":{
      "from":"comments",
      "startWith":"$comments",
      "connectFromField":"comments",
      "connectToField":"_id",
      "as":"children"
    }},
    {
      "$project": {
        "username": 1,
        "title": 1,
        "content": 1,
        "upvotesize": { "$size": "$upvotes" },
        "downvotes": { "$size": "$downvotes" },
        "comments": { "$size": "$children" }
      },
    },
    { "$sort": { "commentsize": -1 } }
  ]).exec((err, results) => {
    if (err) return console.error(err);
    if (results) {
      res.send(results);
    } else {
      res.send(404);
    }
  })
});

router.get('/:id', (req, res) => {
  mongoose.Thread.aggregate([
    { "$match" : { "_id" : mongoose.Types.ObjectId(req.params["id"]) } },
    {"$graphLookup":{
      "from":"comments",
      "startWith":"$comments",
      "connectFromField":"comments",
      "connectToField":"_id",
      "as":"children"
    }},
    { "$addFields": { 
      "children": { 
        "upvotes": { "$size": "$upvotes" },
        "downvotes": { "$size": "$downvotes" }
      }
    }},
    {
      "$project": {
        "user": 1,
        "title": 1,
        "content": 1,
        "upvotes": { "$size": "$upvotes" },
        "downvotes": { "$size": "$downvotes" },
        "comments": "$children"
      },
    }
  ]).exec((err, result) => {
    if (err) return console.error(err);
    if (result) {
      mongoose.User.populate(result, [{path: "user", select: "username"}, {path: "comments.user", select: "username"}],(err, result)=>{
      if (err) return console.error(err);
        res.send(result);
      });
    } else {
      res.send(404);
    }
  })
});

router.post('/', (req, res) => {
  if (req.body.username && req.body.title && req.body.content) {
    mongoose.User.findOne({ username: req.body.username }, (err, user) => {
      if (err) return console.error(err);
      if (user) {
        var thread = new mongoose.Thread({ username: req.body.username, title: req.body.title, content: req.body.content })
        thread.save(() => {
          res.send(thread);
        });
      } else {
        res.send(404);
      }
    });
  } else {
    res.send("Wrong post body");
  }
});

router.put("/:id", (req, res) => {
  mongoose.Thread.findOne({ _id: req.params["id"] }, (err, thread) => {
    if (err) return console.error(err);
    if (thread) {
      thread.content = req.body.content;
      thread.save(() => {
        res.send(thread);
      });
    } else {
      res.send(404);
    }
  });
});

router.delete("/:id", (req, res) => {
  mongoose.Thread.findOne({ _id: req.params["id"] }).populate("comments").exec((err, thread) => {
    if (err) return console.error(err);
    if (thread) {
      thread.remove(() => {
        thread.comments.forEach(comment => {
          comment.remove();
        });
        res.send(thread);
      });
    } else {
      res.send(404);
    }
  });
});

router.post('/upvote/:id', (req, res) => {
  mongoose.User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return console.error(err);
    if (user) {
      mongoose.Thread.findById(req.params['id'], (err, thread) => {
        if (err) return console.error(err);
        if (thread) {
          thread.upvotes.push(user._id);
          thread.downvotes.remove(user._id);
          thread.save(() => {
            res.send(thread);
          });
        } else {
          res.send(404);
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
      mongoose.Thread.findById(req.params['id'], (err, thread) => {
        if (err) return console.error(err);
        if (thread) {
          thread.downvotes.push(user._id);
          thread.upvotes.remove(user._id);
          thread.save(() => {
            res.send(thread);
          });
        } else {
          res.send(404);
        }
      });
    } else {
      res.send(404);
    }
  });
});

module.exports = router;