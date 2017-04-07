const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  description: String,
  subject: String,
  body: String

}, { timestamps: true });

const Email = mongoose.model('Client', emailTemplateSchema);

module.exports = Email;
