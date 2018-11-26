var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = new mongoose.Schema({
  username: String,
  password: String
});
var User = mongoose.model("User", userSchema)

var commentSchema = new mongoose.Schema();
commentSchema.add({
  name: String,
  karma: Number,
  comments: [commentSchema]
});

var threadSchema = new mongoose.Schema({
  title: String,
  content: String,
  karma: Number,
  comments: [commentSchema]
});
var Thread = mongoose.model("Thread", threadSchema)

var testUser = new User({ username: 'admin', password: 'admin' })

testUser.save(() => {
  User.find(function (err, users) {
    if (err) return console.error(err);
    console.log(users);
  })
});


module.exports = {User, Thread};