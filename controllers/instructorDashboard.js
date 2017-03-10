const Client = require('../models/Client');

/**
 * GET /
 * Dashboard.
 */
// TODO: Find out why request count is not accurate
var requests = 0;
exports.getDashboard = (req, res) => {
    Client.count({isDecided: false}, function (err, c) {
        console.log('Count is ' + c);
        requests = c;
    });
    res.render('instructorDashboard', {
        pendingClientRequests: requests,
        title: 'Instructor Dashboard'
    });
};