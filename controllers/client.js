const async = require('async');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Client = require('../models/Client');

/**
 * GET /client-form
 * Client Submission page.
 */
exports.getClientForm = (req, res) => {
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
