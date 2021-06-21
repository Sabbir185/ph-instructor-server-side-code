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

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8lgl.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const planCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_PLAN}`);

    const paymentCollection = client.db(`${process.env.DB_DATABASE}`).collection(`${process.env.DB_PAY}`);

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

    //  client.close();
});


app.listen(process.env.PORT || port);