const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');

let usersArray = [];

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
        res.send(data);
        res.render('users', {userArray: usersArray});
    });
});

app.get('/user/:name', (req, res) => {
    let userName = req.params.name;
    console.log(`GET /user/:name: ${JSON.stringify(req.params)}`);
    user.findOne({ name: userName }, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        console.log(`data -- ${JSON.stringify(data)}`);
        let returnMsg = `user name : ${userName} role : ${data.role}`;
        console.log(returnMsg);
        res.send(returnMsg);
    });
});

app.post('/updateUserRole', (req, res) => {
    console.log(`POST /updateUserRole: ${JSON.stringify(req.body)}`);
    let matchedName = req.body.name;
    let newrole = req.body.role;
    user.findOneAndUpdate( {name: matchedName}, {role: newrole},
        { new: true },
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            console.log(`data -- ${data.role}`);
            let returnMsg = `user name : ${matchedName} New role : ${data.role}`;
            console.log(returnMsg);
            res.send(returnMsg);
        });
});

app.post('/removeUser', (req, res) => {
    console.log(`POST /removeUser: ${JSON.stringify(req.body)}`);
    let matchedName = req.body.name;
    user.findOneAndDelete({ name: matchedName },
        (err, data) => {
            if (err) return console.log(`Oops! ${err}`);
            console.log(`data -- ${JSON.stringify(data)}`);
            let returnMsg = `user name : ${matchedName}, removed data : ${data}`;
            console.log(returnMsg);
            res.send(returnMsg);
        });
});

app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`App Server listening on port: ${port}`)
});
