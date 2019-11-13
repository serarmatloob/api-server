exports.add = function (req, res) {
    console.log(req.body.num1)
    console.log(req.body.num2)
    var result = req.body.num1 + req.body.num2;
    res.json({'result': result});
};

exports.middleware = function (req, res, next) {
    console.log('middleware');
    next();
};