
const mongoose = require('mongoose');
// Read the file and print its contents.
const fs = require('fs');
const Device = require('./models/Device');

function init(callback) {
    let _database = null;
    _database = fs.readFileSync('database.txt', 'utf8', function (err, data) {
		if (err) throw err;
		console.log(data)
		return data;
	});
	mongoose.Promise = require('bluebird');
	mongoose.connect(_database, {
        useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true
    })
    .then(() => {
        callback();
    })
    .catch(err => {
        callback(err);
    });
}

function createDevice(device, callback) {
	device.save().then(callback);
}

function getDeviceByAndroidId(googleAndroidId, callback) {
	Device.findOne({'googleAndroidId': googleAndroidId}, callback);
}

function updateDeviceByAndroidId(googleAndroidId, device, callback) {
	Device.findOneAndUpdate({googleAndroidId: googleAndroidId}, {$set:{'nonce':device.nonce}}, {new: true}, callback);
}

module.exports = {
    init,
    createDevice,
    getDeviceByAndroidId,
    updateDeviceByAndroidId
}

