const Client = require('../models/Client');

/**
 * GET /
 * Dashboard.
 */
exports.getDashboard = (req, res) => {
    // Count the number of client requests where instructor has not yet decided whether they are approved or not
    Client.count({isDecided: false}, (err, count) => {
        console.log('Count is ' + count);
        res.render('instructorDashboard', {
            title: 'Instructor Dashboard',
            pendingClientRequests: count
        });
    });
};