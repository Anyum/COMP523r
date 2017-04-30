const Client = require('../models/Client');
const Email = require('../models/Email');
const async = require('async');
const nodemailer = require('nodemailer');
const Students = require('../models/Student');
const TimeList = require('../models/TimeList');
const xoauth2 = require('xoauth2');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            type: 'OAuth2',
            user: process.env.GMAIL_USER || 'ChrisBrajer@gmail.com',
            clientId: process.env.GMAIL_CLIENT_ID || '894458215286-knid5sq8k9hpp2mjcis72sonkjg66fsc.apps.googleusercontent.com',
            clientSecret: process.env.GMAIL_CLIENT_SECRET || 'NIC_pTikyBFh59xa2kAeFOGH',
            refreshToken: process.env.GMAIL_REFRESH_TOKEN || '1/0-kxyqBHlehh01wQW3-_GdhBKTjnoSv6E-meayhUaVogg0btU2Pp3o5Mr8lPjuyG'
        })
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
            Client.count({isDecided: false, isDeleted: false}, (err, count) => {
                if (err) return callback(err);
                locals.undecided = count;
                callback();
            });
        },
        // Rejected client proposals
        function(callback) {
            Client.count({isDecided: true, isApproved: false, isDeleted: false}, (err, count) => {
                if (err) return callback(err);
                locals.rejected = count;
                callback();
            });
        },
        // Approved client proposals
        function(callback) {
            Client.count({isDecided: true, isApproved: true, isDeleted: false}, (err, count) => {
                if (err) return callback(err);
                locals.approved = count;
                callback();
            });
        },
        // Deleted client proposals
        function(callback) {
            Client.count({isDeleted: true}, (err, count) => {
                if (err) return callback(err);
                locals.deleted = count;
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
            approvedClientRequests: locals.approved,
            deletedClientRequests: locals.deleted
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
            client.status = 'Approved';
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('back');
            });
        } else if (decision == 'Deny') {
            client.isDecided = true;
            client.isApproved = false;
            client.isDeleted = false;
            client.status = 'Rejected';
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('back');
            });
        } else if (decision == 'Delete') {
            client.isDecided = true;
            client.isApproved = false;
            client.isDeleted = true;
            client.status = 'Deleted';
            client.save(function (err, client) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('back');
            });
        } else if (decision == 'Pending') {
            client.isDecided = false;
            client.isApproved = false;
            client.isDeleted = false;
            client.status = 'Pending';
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
    var emailData = JSON.parse(req.body.data[1]);
    res.render('instructor/emailConfirmation',{
        title: 'Finalize your email',
        recipients: emailData.finalRecipients,
        subject: emailData.finalSubject,
        body: emailData.finalBody,
        senderName: emailData.senderName
    });
};

/**
 * POST /instructor/email-confirmation
 * Send an email via Nodemailer.
 */
exports.postEmailConfirmation = (req, res) => {
    var emailData = JSON.parse(req.body.data);
    var recipients = emailData.finalRecipients;
    var subject = emailData.finalSubject;
    var body = emailData.finalBody;
    var senderName = emailData.senderName;
    //emailCategory structure: {Approve: false, Deny: false, Delete: false, Schedule: true}
    var emailCategory = emailData.emailCategory;
    var decision = req.body.Decision;

    // Find the client that the instructor approved/denied. Process CRUD.
    for (recipient of recipients) {
        Client.findOne({_id: recipient._id}, (err, client) => {
            if (err) return handleError(err);
            if (decision == 'Manual') {
                if (emailCategory.Approve == true) {client.sentApproval = true;}
                if (emailCategory.Deny == true) {client.sentDenial = true;}
                if (emailCategory.Delete == true) {client.sentDeletion = true;}
                if (emailCategory.Schedule == true) {client.sentPitchSchedule = true;}
                client.save(function (err, client) {
                    if (err) { return res.status(500).send(err); }
                });
            } else if (decision == 'Automatic') {
                //personalize the body of the message
                var personalizedBody = body;
                personalizedBody = personalizedBody.replace("{Client}", client.name);
                personalizedBody = personalizedBody.replace("{Instructor}", senderName);
                //Send email
                // 'to' is a comma separated list of recipients  e.g. 'bar@blurdybloop.com, baz@blurdybloop.com'
                var mailOptions = {
                    to: `${client.name} <${client.email}>`,
                    from: `${senderName} <${transporter._options.auth.xoauth2.options.user}>`,
                    subject: subject,
                    text: personalizedBody
                };
                // verify connection configuration
                transporter.verify(function(error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Server is ready to take our messages');
                    }
                });
                transporter.sendMail(mailOptions, (err, response) => {
                    if (err) {
                        req.flash('errors', { msg: err.message });
                        console.log(err);
                    }else{
                        req.flash('success', { msg: 'Email has been sent successfully!' });
                        console.log("Message sent: " + response.message);
                    }
                    transporter.close();
                });

                if (emailCategory.Approve == true) {client.sentApproval = true;}
                if (emailCategory.Deny == true) {client.sentDenial = true;}
                if (emailCategory.Delete == true) {client.sentDeletion = true;}
                if (emailCategory.Schedule == true) {client.sentPitchSchedule = true;}
                client.save(function (err, client) {
                    if (err) { return res.status(500).send(err); }
                });
            };
        });
    }
    return res.redirect('/instructor/email-clients');
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

/**
 * GET all email templates
 * returned in JSON format
 */
exports.getEmailTemplates = (req, res) => {
    Email.find({}, (err, Templates) => {
        if (err) return handleError(err);
        res.send(Templates);
    });
};

/**
 * GET /instructor/add-template
 * A form to add an email template
 */
exports.getAddTemplate = (req, res) => {
    res.render('instructor/addTemplate',{
        title: 'Add an email template'
    });
};
/**
 * POST /instructor/add-template
 * Add the template to the database
 */
exports.postAddTemplate = (req, res) => {
    const email = new Email({
        description: req.body.description,
        subject: req.body.subject,
        body: req.body.body,
    });

    email.save((err) => {
        if (err) { throw err; }
        else res.redirect('/instructor');
    });
};
/**
 * GET /instructor/modify-templates
 * Allows you to change or delete templates
 */
exports.getModifyTemplates = (req, res) => {
    Email.find({}, (err, templates) => {
        if (err) return handleError(err);
        res.render('instructor/modifyTemplates', {
            title: 'Modify an existing template',
            templates: templates
        });
    });
};
/**
 * POST /instructor/modify-templates
 * Change templates or delete them
 */
exports.postModifyTemplates= (req, res) => {
    var decision = req.body.modify_button;
    var templateID = req.body.templateID;
    console.log('Recieved request for ' + templateID);
    console.log('Decision is: ' + req.body.modify_button);
    // Find the client that the instructor approved/denied. Process CRUD.
    Email.findOne({_id: templateID}, (err, template) => {
        if (err) return handleError(err);
        if (decision == 'Update') {
            template.description = req.body.description;
            template.subject = req.body.subject;
            template.body = req.body.body;
            template.save(function (err, template) {
                if (err) { return res.status(500).send(err); }
                else return res.redirect('back');
            });
        } else if (decision == 'Delete') {
            template.remove().then(res.redirect('back'));
        }
    });
};

/**
 * GET /instructor/client-chosen-times
 * View the times that clients that selected, and be able to automatically assign final presentation times
 */
exports.getClientTimes = (req, res) => {
    Client.find({ $and: [{selectedTimes: { $exists: true}}, {selectedTimes: { $ne: null}}]}, (err, result) => {
       if (err) return handleError(err);
       res.render('instructor/instructorClientTimes', {
          title: 'Client Time Preferences',
          clients: result
       });
    });
};

/**
 * GET /instructor/assign-success
 * Assigns final presentation times and presents any messages from the algorithm
 */
exports.getAssignSuccess = (req, res) => {
    var clientLists = new Array();
    var times = new Array();
    var messages = new Array();

    Client.find({ $and: [{selectedTimes: { $exists: true}}, {selectedTimes: { $ne: null}}]}).sort({'updatedAt': 'desc'}).exec().then(function(result) {

        // Storing clients in an array
        result.forEach(function(x) {
            clientLists.push({
                "name": x.name,
                "times": x.selectedTimes,
                "presTime": null
            });
        });

        // Gathering relevant list of times
        return TimeList.findOne({'current': true}, 'times', function(err, list) {
            if (err) return handleError(err);
            times = list.times;
        }).exec().then(function() {return result});

    }).then(function(result) {

        // Assigning presentation times
        for (var i=0; i<times.length; i++) {
            var y = new Array();
            var low = 1000;
            var lowIx = new Array();
            for (var j=0; j<clientLists.length; j++) {
                if (clientLists[j].times.indexOf(times[i]) != -1) {
                    y.push(clientLists[j]);
                    if (clientLists[j].times.length < low) {
                        if (clientLists[j].presTime == null) {
                            low = clientLists[j].times.length;
                            lowIx = [];
                            lowIx.push(j);
                        }
                    } else if (clientLists[j].times.length == low) {
                        if (clientLists[j].presTime == null)
                            lowIx.push(j);
                    }
                }
            }
            if (lowIx.length > 0) {
                clientLists[lowIx[0]].presTime = times[i];
            }
        }

        // Updating presentation times in database
        result.forEach(function(x) {
            var ix = clientLists.findIndex(function(element) {return element.name == x.name;});
            x.presentationTime = clientLists[ix].presTime;
            x.save();
            if (x.presentationTime == null)
                messages.push("Client \'" + x.name + "\' did not receive a presentation time.");
        });

        // Rendering success page
        res.render('instructor/instructorAssignSuccess', {
            title: 'Results',
            clients: result,
            messages: messages
        });
    });
};

/**
 * GET /instructor/view-student-submitted-teams
 * Allows you to view-student-submitted-teams
 */
exports.getSubmittedTeams = (req, res) => {
    Students.find({}, (err, Students) => {
        if (err) return handleError(err);
    res.render('instructor/viewStudentSubmittedTeams', {
        title: 'Student Submitted Teams',
        studentTeams: Students
    });
});
};
/**
 * GET /instructor/generate-final-teams
 * Allows you to generate-final-teams
 */
exports.getGeneratedTeams = (req, res) => {
    Students.find({}, (err, Students) => {
        if (err) return handleError(err);
    res.render('instructor/generatedTeams', {
        title: 'Generated Teams of 4',
        studentTeams: Students
    });
});
};

/**
 * GET /instructor/compute-team-mapping-to-projects
 * Allows you to compute-team-mapping-to-projects
 */
exports.getTeamMappingToProjects = (req, res) => {
    Students.find({}, (err, Students) => {
        if (err) return handleError(err);
    res.render('instructor/teamMappingToProjects', {
        title: 'Team Mapping To Projects',
        studentTeams: Students,
        projects: [1,2,3,4,5,6,7,8,9,10,11,12]
    });
});
};