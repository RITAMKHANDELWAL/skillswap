const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyfordevelopmentpurpose', {
    expiresIn: '30d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };

  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user
    });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, skillsOffered, skillsWanted } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user with default 20 credits
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Student',
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      credits: 20
    });

    // Log the signup credit transaction
    await CreditTransaction.create({
      user: user._id,
      type: 'bonus',
      amount: 20,
      description: 'Signup welcome bonus credits'
    });

    // Create welcome notification
    await Notification.create({
      user: user._id,
      title: 'Welcome to SkillSwap!',
      message: 'You have been awarded 20 free learning credits to get started.',
      type: 'credit'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Daily streak logic
    const today = new Date().toDateString();
    const lastActiveDate = user.lastActive ? new Date(user.lastActive).toDateString() : null;
    
    if (lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (lastActiveDate === yesterdayStr) {
        user.streak += 1;
        // Award XP on streak increase
        user.xp += 10;
        if (user.xp >= user.level * 100) {
          user.xp = 0;
          user.level += 1;
          
          await Notification.create({
            user: user._id,
            title: 'Level Up!',
            message: `Congratulations! You reached level ${user.level}!`,
            type: 'achievement'
          });
        }
      } else {
        user.streak = 1;
      }
      user.lastActive = new Date();
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('badges');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
