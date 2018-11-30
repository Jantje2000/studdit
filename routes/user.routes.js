const express = require('express');
const router = express.Router();
const mongoose = require("../db/mongoose");

// For debug purposes
router.get('/', (req, res) => {
  mongoose.User.find((err, result) => {
    if (err) return console.error(err);
    res.send(result);
  })
});

router.post('/', (req, res) => {
  if(req.body.username && req.body.password){
    mongoose.User.where({username: req.body.username}).count((err, count) =>{
      if (err) return console.error(err);
      if(count == 0){
        var user = new mongoose.User({ username: req.body.username, password: req.body.password })
        user.save(() => {
          res.send(user);
        });
      } else{
        res.send("Username taken");
      }
    });
  } else{
    res.send("Wrong post body");
  }
});

router.put("/", (req,res) =>{
  if(req.body.username && req.body.password && req.body.newPassword){
    mongoose.User.findOne({username: req.body.username, password: req.body.password}, (err, user) =>{
      if (err) return console.error(err);
      if(user){
        user.password = req.body.newPassword;
        user.save(() => {
          res.send(user);
        });
      } else{
        res.send(401);
      }
    });
  } else{
    res.send(401);
  }
});

router.delete("/", (req,res) =>{
  if(req.body.username && req.body.password){
    mongoose.User.findOne({username: req.body.username, password: req.body.password}, (err, user) =>{
      if (err) return console.error(err);
      if(user){
        user.remove(() => {
          res.send(user);
        });
      } else{
        res.send(401);
      }
    });
  } else{
    res.send(401);
  }
});

module.exports = router;