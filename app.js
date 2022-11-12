const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config()

const webhook = require('./server/routes/webhook.js');
const usersRoute = require('./server/routes/users.js');
const paymentRoute = require('./server/routes/payment.js');
const notification = require('./server/routes/notification.js');
const { testFirebase } = require('./server/db/conn.js');

const app =  express();

const port = process.env.PORT || 5000;


app.use(cors());
app.use(helmet());
app.use(bodyParser.json({extended: false}));

app.disable('x-powered-by');

app.get('/', (req, res) => {
    testFirebase().then(() => {
        console.log('firebase connection test successful!');
    }).catch((e) => {
        console.log('firebase connection test failed!');
    });
    res.status(200).json({
        "message" : "welcome"
    });
});

app.get('/heartbeat', (req, res) => {
    res.sendStatus(200);
});

app.use('/notification', notification);
app.use('/webhook', webhook);
app.use('/payment', paymentRoute);
app.use('/user', usersRoute);

app.listen(port,() => {
    console.log(`App listening on port: ${port}`);
}).on('connection', (stream) => {
    console.log(`connection FROM:${stream.address().address} on PORT:${stream.address().port}`);
}).on('error', (error) => {
    console.log(`Server Error: ${error}`);
});

module.exports = app