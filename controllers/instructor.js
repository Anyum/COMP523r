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
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('description', 'Description must be at least 50 characters long').len(50);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/client-form');
    }

    const client = new Client({
        email: req.body.email,
        description: req.body.description,
        name: req.body.name,
        term: req.body.term,
        isDecided: false,
        isApproved: false
    });

    client.save((err) => {
        if (err) { throw err; }
        else res.redirect('/submission-successful');
    });
};