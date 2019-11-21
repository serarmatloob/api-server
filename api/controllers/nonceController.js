const crypto = require('crypto');
const db = require('../../database')
const Device = require('../../models/Device')

exports.generate = function (req, res) {
    if(!req.body.googleAndroidId) {
        return res.status(500).send({error: 'You must supply Google android id'});
    }
  
    db.getDeviceByAndroidId(req.body.googleAndroidId, (err, device) => {
        if(err) {
            console.log('error: '+err);
        }
        if(device) {
            const nonce = crypto.randomBytes(16).toString('base64');
            device.nonce = nonce;
            db.updateDeviceByAndroidId(req.body.googleAndroidId, device, (err, device) => {
                if(err) {
                    console.log(err);
                    return res.status(500).send();
                }
                res.status(200).send({nonce: nonce});
            })
        }
        else {
            const nonce = crypto.randomBytes(16).toString('base64');
            const device = new Device({ googleAndroidId: 1234, nonce: nonce});
            db.createDevice(device, () => {
                res.status(200).send({nonce: nonce});
            })
        }
        
        
    })
    // const nonce = crypto.randomBytes(16).toString('base64');
    // const device = new Device({ googleAndroidId: 123, nonce: nonce});
    // db.createDevice(device, () => {
    //     res.status(200).send({nonce: nonce});
    // })
};