const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true,
    default: 'Award' // Default Lucide React Icon name
  },
  requirements: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Badge', BadgeSchema);
