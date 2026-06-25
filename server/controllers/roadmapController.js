const Roadmap = require('../models/Roadmap');
const { generateRoadmap } = require('../services/aiService');

exports.createRoadmap = async (req, res, next) => {
  try {
    const { targetGoal } = req.body;
    if (!targetGoal) {
      return res.status(400).json({ success: false, message: 'Please provide a target goal' });
    }

    // Call AI service (falls back to mock if key is missing)
    const generated = await generateRoadmap(targetGoal, req.user.skillsOffered);

    const roadmap = await Roadmap.create({
      user: req.user.id,
      title: generated.title,
      targetGoal,
      skillsAnalyzed: generated.skillsAnalyzed,
      skillGaps: generated.skillGaps,
      weeks: generated.weeks,
      progress: 0
    });

    res.status(201).json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};

exports.getRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: roadmaps.length, roadmaps });
  } catch (error) {
    next(error);
  }
};

exports.getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};

exports.updateMilestoneProgress = async (req, res, next) => {
  try {
    const { weekId, milestoneId, completed } = req.body;
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user.id });

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    // Find and update the milestone
    let found = false;
    for (let week of roadmap.weeks) {
      if (week._id.toString() === weekId) {
        for (let ms of week.milestones) {
          if (ms._id.toString() === milestoneId) {
            ms.completed = completed;
            found = true;
            break;
          }
        }
        // Recalculate if all milestones in the week are completed
        week.completed = week.milestones.every(ms => ms.completed);
      }
    }

    if (!found) {
      return res.status(400).json({ success: false, message: 'Milestone not found' });
    }

    // Calculate total progress
    let totalMilestones = 0;
    let completedMilestones = 0;
    
    roadmap.weeks.forEach(w => {
      w.milestones.forEach(m => {
        totalMilestones++;
        if (m.completed) {
          completedMilestones++;
        }
      });
    });

    roadmap.progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    roadmap.isCompleted = roadmap.progress === 100;

    await roadmap.save();
    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};
