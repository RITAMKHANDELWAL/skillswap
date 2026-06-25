const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: '' },
  type: { type: String, enum: ['video', 'article', 'book', 'course', 'documentation'], default: 'article' }
});

const MilestoneSchema = new mongoose.Schema({
  task: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const WeeklyTopicSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  topic: { type: String, required: true },
  description: { type: String, default: '' },
  resources: [ResourceSchema],
  milestones: [MilestoneSchema],
  completed: { type: Boolean, default: false }
});

const RoadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  targetGoal: {
    type: String,
    required: true
  },
  skillsAnalyzed: [String],
  skillGaps: [String],
  weeks: [WeeklyTopicSchema],
  progress: {
    type: Number, // Percentage 0-100
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
