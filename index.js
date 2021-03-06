const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const settings = require('./config');

const app = express();

// Use morgan so we can get detailed requests logging
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

process.env.NODE_ENV = "testCloud";

//Make sure that all routes will have to be authenticated
app.use('/user', require('./routes/user.routes'));
app.use('/thread', require('./routes/thread.routes'));
app.use('/comment', require('./routes/comment.routes'));
app.use('/friend', require('./routes/friend.routes'));


// This will be called when no other routes are found
app.use('*', function (req, res, next) {
    console.log('This endpoint does not exist');
    let message = {
        error: "This endpoint does not exist"
    };
    next(message)
});

// This will handle all errors
app.use((err, req, res, next) => {
    console.log('Catch-all error handler was called.');
    console.log(err);

    res.status(404).json(err).end()
});

const port = process.env.PORT || settings.webPort;

app.listen(port, () => {
    console.log('Server running on:  ' + port)
});

module.exports = app;