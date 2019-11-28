const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({

	googleAndroidId: {
		type: String,
		unique: true,
		sparse: true,
		required: false,
	},
	
	nonce: { type: String },
});

const Device = mongoose.model('Device', deviceSchema, 'Devices');

module.exports = Device;