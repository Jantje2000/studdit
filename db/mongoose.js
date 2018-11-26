var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = new mongoose.Schema({
  username: String,
  password: String
});
var User = mongoose.model("User", userSchema)

var threadSchema = new mongoose.Schema();
threadSchema.add({
  name: String,
  karma: Number,
  comments: [threadSchema]
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