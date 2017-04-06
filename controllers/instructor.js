const Client = require('../models/Client');
const async = require('async');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

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
        res.render('instructor/instructorDashboard', {
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
    res.render('instructor/instructorClientProposals',{
        title: 'Review Client Proposals'
    });
};
//The following three GET requests are dynamic content populated in client-proposals
/**
 * GET /instructor/pendingProjects
 * Display all pending client projects
 */
exports.getPendingProjects = (req, res) => {
    Client.find({isDecided: false, isDeleted: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.render('instructor/pendingProjects', {
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
    Client.find({isDecided: true, isApproved: true, isDeleted: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.render('instructor/approvedProjects', {
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
    Client.find({isDecided: true, isApproved: false, isDeleted: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.render('instructor/rejectedProjects', {
            title: 'Rejected Client Proposals',
            clients: Clients
        });
    });
};
/**
 * GET /instructor/deletedProjects
 * Display all deleted client projects
 */
exports.getDeletedProjects = (req, res) => {
    Client.find({isDeleted: true}, (err, Clients) => {
        if (err) return handleError(err);
        res.render('instructor/deletedProjects', {
            title: 'Deleted Client Proposals',
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
            client.isDeleted = false;
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('back');
            });
        } else if (decision == 'Deny') {
            client.isDecided = true;
            client.isApproved = false;
            client.isDeleted = false;
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('back');
            });
        } else if (decision == 'Delete') {
            client.isDecided = true;
            client.isApproved = false;
            client.isDeleted = true;
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('back');
            });
        };
    });
};

/**
 * GET /instructor/email-clients
 * Display all pending client proposals, and all approval/denial by instructor.
 */
exports.getEmailClients = (req, res) => {
    res.render('instructor/instructorEmailClients',{
        title: 'Manage client emails'
    });
};

/**
 * POST /instructor/email-clients
 * Send an email via Nodemailer.
 */
exports.postEmailClients = (req, res) => {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('message', 'Message cannot be blank').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/contact');
    }

    // 'to' is a comma separated list of recipients  e.g. 'bar@blurdybloop.com, baz@blurdybloop.com'
    const mailOptions = {
        to: 'your@email.com',
        from: `${req.body.name} <${req.body.email}>`,
        subject: 'Contact Form | Hackathon Starter',
        text: req.body.message
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            req.flash('errors', { msg: err.message });
            return res.redirect('/contact');
        }
        req.flash('success', { msg: 'Email has been sent successfully!' });
        res.redirect('/contact');
    });
};

//The following three GET requests for JSON of all client types
//This is only a slight change to the full page renders. Change this later?
/**
 * GET /instructor/pendingProjects
 * Display all pending client projects
 */
exports.getPendingJSON = (req, res) => {
    Client.find({isDecided: false, isDeleted: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.send(Clients);
    });
};
/**
 * GET /instructor/approvedProjects
 * Display all approved client projects
 */
exports.getApprovedJSON = (req, res) => {
    Client.find({isDecided: true, isApproved: true, isDeleted: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.send(Clients);
    });
};
/**
 * GET /instructor/rejectedProjects
 * Display all rejected client projects
 */
exports.getRejectedJSON = (req, res) => {
    Client.find({isDecided: true, isApproved: false, isDeleted: false}, (err, Clients) => {
        if (err) return handleError(err);
        res.send(Clients);
    });
};
/**
 * GET /instructor/deletedProjects
 * Display all deleted client projects
 */
exports.getDeletedJSON = (req, res) => {
    Client.find({isDeleted: true}, (err, Clients) => {
        if (err) return handleError(err);
        res.send(Clients);
    });
};