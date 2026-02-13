const mongoose = require('mongoose');

const UIVersionSchema = new mongoose.Schema({
  prompt: String,
  plan: Object,        // Planner
  generatedCode: String, // Generator
  explanation: String,   // Explainer
  version: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UIVersion', UIVersionSchema);