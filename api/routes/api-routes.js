'use strict';
module.exports = function(app) {
  var compute = require('../controllers/computeController');
  var nonce = require('../controllers/nonceController');

  // Compute Route
  app.route('/compute')
    .post(compute.middleware, compute.add)

    // Nonce Route
  app.route('/nonce')
  .post(nonce.generate)
};