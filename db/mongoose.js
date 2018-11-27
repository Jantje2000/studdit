var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = mongoose.Types;
mongoose.connect('mongodb://localhost/test',{ useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = new Schema({
  username: String,
  password: String
});
var User = mongoose.model("User", userSchema)

var commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  content: String,
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});
var Comment = mongoose.model("Comment", commentSchema)

var threadSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});
var Thread = mongoose.model("Thread", threadSchema)

// var testUser = new User({ username: 'admin', password: 'admin' })
// testUser.save(() => {
//   User.find(function (err, users) {
//     if (err) return console.error(err);
//     console.log(users);
//   })
// });

// var testComment1 = new Comment({ user: testUser._id, content: 'This is a test1'});
// testComment1.save();
// var testComment2 = new Comment({ user: testUser._id, content: 'This is a test2', comments:[testComment1._id]});
// testComment2.save();

// var testThread = new Thread({ user: testUser._id, title: 'Test', content: 'This is a test', comments:[testComment2._id] });
// testThread.save(() => {
//   Thread.find(function (err, thread) {
//     if (err) return console.error(err);
//     console.log(thread);
//   })
// });

module.exports = {User, Comment, Thread, Types};