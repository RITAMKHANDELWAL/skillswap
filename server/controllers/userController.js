const User = require('../models/User');
const Notification = require('../models/Notification');
const CreditTransaction = require('../models/CreditTransaction');

exports.getUsers = async (req, res, next) => {
  try {
    const { skill, search, role } = req.query;
    const query = { _id: { $ne: req.user.id } };

    if (role) {
      query.role = role;
    }

    if (skill) {
      query.$or = [
        { skillsOffered: { $regex: skill, $options: 'i' } },
        { skillsWanted: { $regex: skill, $options: 'i' } }
      ];
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query).select('-password');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('badges');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { bio, skillsOffered, skillsWanted } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (skillsOffered !== undefined) user.skillsOffered = skillsOffered;
    if (skillsWanted !== undefined) user.skillsWanted = skillsWanted;

    await user.save();
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

exports.getCreditTransactions = async (req, res, next) => {
  try {
    const transactions = await CreditTransaction.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
};
