var safetynet = require('./safetynet');
const db = require('../../database')
const Device = require('../../models/Device')

exports.add = function (req, res) {
    console.log(req.body.num1)
    console.log(req.body.num2)
    var result = req.body.num1 + req.body.num2;
    res.status(200).send({result: result});
};

exports.middleware = function (req, res, next) {
    console.log('middleware');
    if(!req.body.safety) {
        res.status(200).send({error: true, message: 'Access Denied'});
    }

    db.getDeviceByAndroidId(req.body.googleAndroidId, (err, device) => {
        if(err) {
            console.log('error: '+err);
        }
        if(device) {
            // const nonce = crypto.randomBytes(16).toString('base64');
            var safetynet_verified = safetynet.verifySafetyNetAttestation(req.body.safety, device.nonce);
            console.log(safetynet_verified);
            if(safetynet_verified){
                next();
            }
            else {
                res.status(200).send({error: true, message: 'Access Denied'});
            }
        }
        else {
            res.status(200).send({error: true, message: 'Access Denied'});
        }
        
        
    })
    
};