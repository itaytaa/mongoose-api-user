const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 4000;
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = mongoose.model('User', {
    username: {
        type: String,
        unique: true,
        index: true,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 18
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 16,
        trim: true

    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female'],
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    email: {
        type: String,
        required: true,
        trim: true,
        required: function () {
            return this.age < 70 ? true : false
        }
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    }
});

app.put('/user', (req, res) => {
    const user = new User(req.body);
    user.save()
        .then(newUser => {
            res.status(201).send(newUser)
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send(err)
        })
});

app.get('/user', (req, res) => {
    User.find()
        .then(users => {
            const response = {
                count: users.length,
                users: users

            }
            res.status(200).send(response)
        })
        .catch(() => res.sendStatus(500))
});

app.get('/user/:id', (req, res) => {
    User.findById(req.params.id)
        .then(user => res.json(user))
        .catch(() => res.sendStatus(500))
});

app.delete('/user/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(deletedUser => {
            if (!deletedUser) {
                res.sendStatus(404)
                return;
            }
            res.sendStatus(204)
        })
        .catch(() => res.sendStatus(500))
})
app.post('/user/:id', (req, res) => {
    User.findByIdAndUpdate(
        req.params.id,
        req.body
    )
        .then(updatedUser => {
            if (!updatedUser) {
                res.sendStatus(404);
                return;
            }
            res.sendStatus(200)
        })
        .catch((err) => {
            res.status(400).send(err)
        })

})


function connect() {
    mongoose.connect('mongodb://localhost/mekusharim', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        app.listen(port, () => console.log(`Server listening on port ${port}!`));
    });
}
connect()