const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/userManagement',
    {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    console.log('db connected');
});

const userSchema = new mongoose.Schema({
    userId: String,
    firstName: String,
    lastName: String,
    email: String,
    age: Number
});

const user = mongoose.model('userCollection', userSchema);

app.set('views', path.join(__dirname, 'views'));
app.set ('view engine', 'pug');

app.get('/', (req,res) => {
    res.redirect('/users');
});

app.get('/newUser', (req,res) => {
    res.render('newUser');
});

app.post('/newUser', (req, res) => {
    console.log(`POST /newUser: ${JSON.stringify(req.body)}`);
    const newUser = new user();
    newUser.userId = req.body.username;
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.email = req.body.email;
    newUser.age = req.body.age;
    newUser.save((err, data) => {
        if (err) {
            return console.error(err);
        }
        console.log(`new user save: ${data}`);
        res.redirect('/users');
    });
});

app.get('/users', (req, res) => {
    console.log(`GET /user/:name: ${JSON.stringify(req.params)}`);
    user.find({}, (err, data) => {
        res.render('users', {userArray: data});
    });
});

app.get('/user/:name', (req, res) => {
    console.log(`GET /user/:name: ${JSON.stringify(req.params)}`);
    user.find({ userId: req.params.name }, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        console.log(data[0]);
        res.render('edit', {user: data[0]});
    });
});

app.post('/updateUser', (req, res) => {
    console.log(`POST /updateUserRole: ${JSON.stringify(req.body)}`);
    console.log(req.body);

    let matchName = req.body.username;
    let newFirstName = req.body.firstName;
    let newLastName = req.body.lastName;
    let newEmail = req.body.email;
    let newAge = req.body.age;

    user.findOneAndUpdate( {userId: matchName}, {firstName: newFirstName, lastName: newLastName, email: newEmail, age: newAge},
        {new: true},
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            console.log(`data -- ${data}`);
            res.redirect('/users');
        });
});

app.get('/removeUser/:userId', (req, res) => {
    console.log(`POST /removeUser: ${JSON.stringify(req.body)}`);
    user.findOneAndDelete({ userId: req.params.userId },
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            console.log(`data -- ${JSON.stringify(data)}`);
            res.redirect('/users');
        });
});

app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`App Server listening on port: ${port}`)
});
