const Client = require('../models/Client');

/**
 * GET /
 * Dashboard.
 */
exports.getDashboard = (req, res) => {
    // Count the number of client requests where instructor has not yet decided whether they are approved or not
    Client.count({isDecided: false}, (err, count) => {
        if (err) return handleError(err);
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
        if (err) return handleError(err);
        res.render('instructorClientProposals', {
            title: 'Review Client Proposals',
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
        } else {
            client.isDecided = true;
            client.isApproved = false;
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('/instructor/client-proposals');
            });
        }
    });
};