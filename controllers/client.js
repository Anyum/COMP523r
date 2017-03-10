const async = require('async');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Client = require('../models/Client');

/**
 * GET /client-information
 * Information for prospective clients on the class
 * From here they are directed to fill out client agreement.
 */
exports.getClientInformation = (req, res) => {
    res.render('clientInformation', {
        title: 'Information for Clients'
    });
};

/**
 * GET /client-agreement
 * Client agreement and disclaimer.
 * From here they are directed to fill out the client form.
 */
exports.getClientAgreement = (req, res) => {
    res.render('clientAgreement', {
        title: 'Client Agreement'
    });
};

/**
 * POST /client-agreement
 * Make sure they have checked the boxes, then pass them on to the client form.
 */
// TODO: make this function
exports.postClientAgreement = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('description', 'Description must be at least 50 characters long').len(50);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/client-form');
    }
};

/**
 * GET /client-form
 * Client Submission page.
 */
exports.getClientForm = (req, res) => {
    // TODO: Make sure that they are coming from the client information page
    console.log(req.originalUrl);
    res.render('clientForm', {
        title: 'Client Submission Form'
    });
};

/**
 * POST /client-form
 * Submit a client request.
 */
exports.postClientForm = (req, res, next) => {
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

  //TODO: Make sure this code snippet works
  client.save((err) => {
      if (err) { throw err; }
      else res.redirect('/submission-successful');
  });
};
