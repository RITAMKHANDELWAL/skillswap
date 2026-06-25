const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillsMatched: [String],
  matchScore: {
    type: Number,
    required: true
  },
  matchPercentage: {
    type: Number,
    required: true
  },
  breakdownReasons: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);
