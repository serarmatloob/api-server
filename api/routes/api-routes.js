'use strict';
module.exports = function(app) {
  var compute = require('../controllers/computeController');

  // Compute Route
  app.route('/compute')
    .post(compute.middleware, compute.add)
};