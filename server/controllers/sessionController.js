const Session = require('../models/Session');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');
const { generateSessionSummary } = require('../services/aiService');

const SESSION_COST = 5;
const SESSION_REWARD = 10;

exports.scheduleSession = async (req, res, next) => {
  try {
    const { mentorId, date, duration } = req.body;

    if (!mentorId || !date) {
      return res.status(400).json({ success: false, message: 'Please provide mentorId and date' });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    const learner = await User.findById(req.user.id);
    if (learner.credits < SESSION_COST) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits. You need at least ${SESSION_COST} credits to book a session.`
      });
    }

    // Deduct credits from learner
    learner.credits -= SESSION_COST;
    await learner.save();

    // Create transaction record
    await CreditTransaction.create({
      user: learner._id,
      type: 'spend',
      amount: SESSION_COST,
      description: `Scheduled session with mentor ${mentor.name}`
    });

    const session = await Session.create({
      learner: learner._id,
      mentor: mentor._id,
      date,
      duration: duration || 60,
      meetingLink: `https://meet.google.com/skillswap-${Math.random().toString(36).substring(2, 10)}`
    });

    // Create notification for mentor
    await Notification.create({
      user: mentor._id,
      title: 'New Session Scheduled',
      message: `${learner.name} has scheduled a session with you on ${new Date(date).toLocaleString()}.`,
      type: 'session'
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      $or: [{ learner: req.user.id }, { mentor: req.user.id }]
    })
      .populate('learner', 'name email profilePicture bio skillsOffered skillsWanted')
      .populate('mentor', 'name email profilePicture bio skillsOffered skillsWanted')
      .sort('-date');

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

exports.updateSessionStatus = async (req, res, next) => {
  try {
    const { status, sessionNotes } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isMentor = session.mentor.toString() === req.user.id;
    const isLearner = session.learner.toString() === req.user.id;

    if (!isMentor && !isLearner) {
      return res.status(401).json({ success: false, message: 'Unauthorized session modification' });
    }

    const oldStatus = session.status;
    session.status = status;

    if (sessionNotes !== undefined) {
      session.sessionNotes = sessionNotes;
    }

    // Completion credit transaction logic
    if (status === 'completed' && oldStatus !== 'completed') {
      const mentor = await User.findById(session.mentor);
      const learner = await User.findById(session.learner);

      // Award credits to mentor
      mentor.credits += SESSION_REWARD;
      mentor.hoursTaught += session.duration / 60;
      mentor.xp += 30; // 30 XP reward
      
      // Auto level up mentor
      if (mentor.xp >= mentor.level * 100) {
        mentor.xp = 0;
        mentor.level += 1;
        await Notification.create({
          user: mentor._id,
          title: 'Level Up!',
          message: `Congratulations! You reached level ${mentor.level}!`,
          type: 'achievement'
        });
      }
      await mentor.save();

      // Record transaction
      await CreditTransaction.create({
        user: mentor._id,
        type: 'earn',
        amount: SESSION_REWARD,
        description: `Completed mentoring session with ${learner.name}`
      });

      // Update hours for learner
      learner.hoursLearned += session.duration / 60;
      learner.xp += 15; // 15 XP reward
      if (learner.xp >= learner.level * 100) {
        learner.xp = 0;
        learner.level += 1;
        await Notification.create({
          user: learner._id,
          title: 'Level Up!',
          message: `Congratulations! You reached level ${learner.level}!`,
          type: 'achievement'
        });
      }
      await learner.save();

      // Generate AI Summary
      const summary = await generateSessionSummary(mentor.name, learner.name, session.date, session.sessionNotes);
      session.aiSummary = summary;

      // Notification
      await Notification.create({
        user: mentor._id,
        title: 'Session Credits Earned',
        message: `Earned ${SESSION_REWARD} credits for completing mentorship with ${learner.name}.`,
        type: 'credit'
      });

      await Notification.create({
        user: learner._id,
        title: 'Mentorship Session Completed',
        message: `Your session with ${mentor.name} is complete. You taught/learned!`,
        type: 'session'
      });
    }

    // Cancellation credit transaction refund logic
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const learner = await User.findById(session.learner);
      learner.credits += SESSION_COST;
      await learner.save();

      await CreditTransaction.create({
        user: learner._id,
        type: 'bonus',
        amount: SESSION_COST,
        description: `Refunded credits due to session cancellation`
      });

      const cancelerName = isMentor ? 'Mentor' : 'Learner';
      const notifiedUser = isMentor ? session.learner : session.mentor;

      await Notification.create({
        user: notifiedUser,
        title: 'Session Cancelled',
        message: `Mentorship session on ${new Date(session.date).toLocaleString()} was cancelled by the ${cancelerName}.`,
        type: 'session'
      });
    }

    await session.save();
    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.learner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Only learners can submit mentor reviews' });
    }

    session.rating = rating;
    session.feedback = feedback;
    await session.save();

    // Recalculate mentor rating
    const mentor = await User.findById(session.mentor);
    const sessions = await Session.find({ mentor: mentor._id, rating: { $exists: true } });
    
    const totalRating = sessions.reduce((acc, curr) => acc + curr.rating, 0);
    mentor.rating = sessions.length > 0 ? Number((totalRating / sessions.length).toFixed(1)) : 5.0;
    mentor.ratingsCount = sessions.length;
    await mentor.save();

    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};
