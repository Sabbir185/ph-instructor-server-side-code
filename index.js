const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const bodyParser = require('body-parser')
const ObjectId = require('mongodb').ObjectId;
const port = 5055;
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8lgl.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const planCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_PLAN}`);

    const paymentCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_PAY}`);

    const jobPostCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_POST}`);

    const applicationCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_APPLICATION}`);

    // perform actions on the collection object
    app.post('/plan', (req, res) => {
        const info = req.body;
        const { support, notification, hours, plan, cost } = info;
        planCollection.insertOne({ support, notification, hours, plan, cost })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // get package plan data
    app.get('/getPackages', (req, res) => {
        planCollection.find({})
            .toArray((err, doc) => {
                res.send(doc)
            })
    })

    // get specific package data
    app.get('/getPackInfo', (req, res) => {
        const hr = req.query.hours;
        planCollection.find({ hours: parseInt(hr) })
            .toArray((err, doc) => {
                res.send(doc)
            })
    })

    // post employer payment status
    app.post('/paymentStatus', (req, res) => {
        const payStatus = req.body;
        paymentCollection.insertOne(payStatus)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // get employer payment status
    app.get('/getPayInfo', (req, res) => {
        const id = req.query.id;
        paymentCollection.find({ id: id })
            .toArray((err, doc) => {
                res.send(doc)
            })
    })

    // update employer payment status and profile
    app.patch('/updateSubmit', (req, res) => {
        const id = req.query.id;
        paymentCollection.updateOne({ id: id },
            { $set: { email: req.body.email, password: req.body.password } })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    })

    // job post collection
    app.post('/jobPost', (req, res) => {
        const post = req.body;
        console.log(post)
        jobPostCollection.insertOne(post)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // fetch job post collection
    app.get('/jobViewAdmin', (req, res) => {
        jobPostCollection.find({})
            .toArray((err, doc) => {
                res.send(doc)
            })
    })

    // admin permission and update employer post
    app.patch('/postPermission/:id', (req, res) => {
        const id = req.query.id;
        jobPostCollection.updateOne({ _id: ObjectId(req.params.id) },
            { $set: { adminPermission: req.body.adminPermission } })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    })

    // view details
    app.get('/viewDetails/:id', (req, res) => {
        const id = req.query.id;
        jobPostCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, doc) => {
                res.send(doc)
            })
    })

    // collect all candidate application
    app.post('/allApplication', (req, res) => {
        const apply = req.body;
        applicationCollection.insertOne(apply)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // collect all candidate application
    app.get('/allApplicationView', (req, res) => {
        applicationCollection.find({})
            .toArray((err, doc) => {
                res.send(doc)
            })
    })

    // filter home page
    app.get('/filterJob', (req, res) => {
        const filter = req.query.skill;
        jobPostCollection.find({ skills: filter })
            .toArray((err, doc) => {
                res.send(doc)
            })
    })

    //  client.close();
});


app.listen(process.env.PORT || port);