const Client = require('../models/Client');

/**
 * GET /
 * Dashboard.
 */
exports.getDashboard = (req, res) => {
    // Count the number of client requests where instructor has not yet decided whether they are approved or not
    Client.count({isDecided: false}, (err, count) => {
        res.render('instructorDashboard', {
            title: 'Instructor Dashboard',
            pendingClientRequests: count
        });
    });
};

/**
 * GET /instructor/client-submission
 * Display all pending client proposals, and all approval/denial by instructor.
 */
exports.getClientProposals = (req, res) => {
    Client.find({isDecided: false}, (err, Clients) => {
        // console.log(Clients);
        res.render('instructorClientProposals', {
            title: 'Review Client Proposals',
            clients: Clients
        });
    });
};

/**
 * POST /instructor
 * Submit instructor's approval/denials.
 */
exports.postClientProposals= (req, res) => {
    // TODO: Implement this properly
    console.log('Recieved request for ' + req.body.clientID);
    console.log('This instructor ' + req.body.Decision + ' this request');
    res.redirect('/instructor/client-proposals');
};