const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, 'Must have at least 2 options']
  },
  correctAnswer: {
    type: Number, // index of option
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const QuizSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    unique: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  questions: [QuestionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);
