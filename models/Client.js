const mongoose = require('mongoose');

const clientRequestSchema = new mongoose.Schema({
  email: String,
  name: String,
  description: String,
  term: String,
  isDecided: Boolean,
  isApproved: Boolean

}, { timestamps: true });

const Client = mongoose.model('Client', clientRequestSchema);

module.exports = Client;
