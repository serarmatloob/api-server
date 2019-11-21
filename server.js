const db = require('./database');
var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000;
bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/api-routes'); //importing route
routes(app); //register the route

app.listen(port);

db.init((err) => {
    if(err) {
        console.error('Could not connect to MongoDB:‌', err);
        process.exit(2);
    }
    else {
        console.log('Connected to MongoDB ...');
    }
})

// const mongoose = require('mongoose');
// const Device = mongoose.model('Device', { name: String }, 'Devices');



console.log('RESTful API server started on port: ' + port);