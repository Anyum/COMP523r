const Client = require('../models/Client');
const async = require('async');

/**
 * GET /
 * Dashboard.
 */
exports.getDashboard = (req, res) => {
    var locals = {};
    // process all 3 queries in parallel
    // all queries return a `callback` when complete
    // waits for all 3 callbacks to process asynchronously, then proceeds
    async.parallel([
        // Undecided client proposals
        function(callback) {
            Client.count({isDecided: false}, (err, count) => {
                if (err) return callback(err);
                locals.undecided = count;
                callback();
            });
        },
        // Rejected client proposals
        function(callback) {
            Client.count({isDecided: true, isApproved: false}, (err, count) => {
                if (err) return callback(err);
                locals.rejected = count;
                callback();
            });
        },
        // Approved client proposals
        function(callback) {
            Client.count({isDecided: true, isApproved: true}, (err, count) => {
                if (err) return callback(err);
                locals.approved = count;
                callback();
            });
        }
    ], function(err) { //This function gets called after the three tasks have called their "task callbacks"
        if (err) return next(err); //If an error occurred, we let express handle it by calling the `next` function
        //Here `locals` will be an object with `undecided`, `rejected` and `approved` keys
        res.render('instructorDashboard', {
            title: 'Instructor Dashboard',
            pendingClientRequests: locals.undecided,
            rejectedClientRequests: locals.rejected,
            approvedClientRequests: locals.approved
        });
    });
};

/**
 * GET /instructor/client-proposals
 * Display all pending client proposals, and all approval/denial by instructor.
 */
exports.getClientProposals = (req, res) => {
    res.render('instructorClientProposals',{
        title: 'Review Client Proposals'
    });
};
//The following three GET requests are dynamic content populated in client-proposals
/**
 * GET /instructor/pendingProjects
 * Display all pending client projects
 */
exports.getPendingProjects = (req, res) => {
    Client.find({isDecided: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.render('pendingProjects', {
            title: 'Pending Client Proposals',
            clients: Clients
        });
    });
};
/**
 * GET /instructor/approvedProjects
 * Display all approved client projects
 */
exports.getApprovedProjects = (req, res) => {
    Client.find({isDecided: true, isApproved: true}, (err, Clients) => {
        if (err) return handleError(err);
        res.render('approvedProjects', {
            title: 'Approved Client Proposals',
            clients: Clients
        });
    });
};
/**
 * GET /instructor/rejectedProjects
 * Display all rejected client projects
 */
exports.getRejectedProjects = (req, res) => {
    Client.find({isDecided: true, isApproved: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.render('rejectedProjects', {
            title: 'Rejected Client Proposals',
            clients: Clients
        });
    });
};

/**
 * POST /instructor
 * Submit instructor's approval/denials.
 * Change the client's values of isDecided and isApproved accordingly
 */
exports.postClientProposals= (req, res) => {
    var decision = req.body.Decision;
    var clientID = req.body.clientID;
    console.log('Recieved request for ' + clientID);
    console.log('This instructor ' + decision + ' this request');
    // Find the client that the instructor approved/denied. Process CRUD.
    Client.findOne({_id: clientID}, (err, client) => {
        if (err) return handleError(err);
        if (decision == 'Approve') {
            client.isDecided = true;
            client.isApproved = true;
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('/instructor/client-proposals');
            });
        } else if (decision == 'Deny') {
            client.isDecided = true;
            client.isApproved = false;
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('/instructor/client-proposals');
            });
        } else if (decision == 'Delete') {
            client.remove(function (err) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('/instructor/client-proposals');
            });
        };
    });
};