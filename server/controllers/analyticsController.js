const User = require('../models/User');
const Session = require('../models/Session');
const Roadmap = require('../models/Roadmap');
const CreditTransaction = require('../models/CreditTransaction');
const Badge = require('../models/Badge');

exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('badges');

    // Count schedules
    const totalSessionsCount = await Session.countDocuments({
      $or: [{ learner: userId }, { mentor: userId }]
    });

    const activeSessionsCount = await Session.countDocuments({
      $or: [{ learner: userId }, { mentor: userId }],
      status: 'scheduled'
    });

    // Count roadmaps
    const activeRoadmapsCount = await Roadmap.countDocuments({ user: userId, isCompleted: false });
    const completedRoadmapsCount = await Roadmap.countDocuments({ user: userId, isCompleted: true });

    // Fetch transactions for Recharts charting (e.g. last 7 transactions)
    const recentTransactions = await CreditTransaction.find({ user: userId })
      .sort('-createdAt')
      .limit(7);

    // Calculate learning streak metrics
    const hoursLearned = user.hoursLearned;
    const hoursTaught = user.hoursTaught;

    res.status(200).json({
      success: true,
      analytics: {
        credits: user.credits,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        hoursLearned,
        hoursTaught,
        totalSessionsCount,
        activeSessionsCount,
        activeRoadmapsCount,
        completedRoadmapsCount,
        badgesCount: user.badges.length,
        recentTransactions: recentTransactions.reverse(),
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    // Find top users by streak, hoursTaught, and badges
    const streakLeaders = await User.find()
      .sort('-streak')
      .limit(5)
      .select('name profilePicture bio streak level');

    const teachingLeaders = await User.find()
      .sort('-hoursTaught')
      .limit(5)
      .select('name profilePicture bio hoursTaught rating level');

    const badgeLeaders = await User.find()
      .sort({ 'badges.length': -1 })
      .limit(5)
      .select('name profilePicture bio badges level');

    res.status(200).json({
      success: true,
      leaderboard: {
        streakLeaders,
        teachingLeaders,
        badgeLeaders
      }
    });
  } catch (error) {
    next(error);
  }
};
