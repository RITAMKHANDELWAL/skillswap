const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Badge = require('../models/Badge');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');

exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().select('skillName questions.text');
    res.status(200).json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    next(error);
  }
};

exports.getQuizBySkill = async (req, res, next) => {
  try {
    const skill = req.params.skill;
    const quiz = await Quiz.findOne({ skillName: { $regex: new RegExp(`^${skill}$`, 'i') } });

    if (!quiz) {
      return res.status(404).json({ success: false, message: `No quiz found for skill: ${skill}` });
    }

    // Secure design: Do not send correctAnswer indices to the client
    const secureQuestions = quiz.questions.map(q => ({
      _id: q._id,
      text: q.text,
      options: q.options
    }));

    res.status(200).json({
      success: true,
      quiz: {
        _id: quiz._id,
        skillName: quiz.skillName,
        questions: secureQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.submitQuizAnswers = async (req, res, next) => {
  try {
    const { skill } = req.params;
    const { answers } = req.body; // Array of option indices (e.g. [0, 2, 1, 3]) or key-value object

    const quiz = await Quiz.findOne({ skillName: { $regex: new RegExp(`^${skill}$`, 'i') } });
    if (!quiz) {
      return res.status(404).json({ success: false, message: `No quiz found for skill: ${skill}` });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const breakdown = [];

    quiz.questions.forEach((q, idx) => {
      const submitted = answers[idx];
      const isCorrect = submitted === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }
      breakdown.push({
        question: q.text,
        submittedAnswer: q.options[submitted] || 'Skipped',
        correctAnswer: q.options[q.correctAnswer],
        isCorrect,
        explanation: q.explanation
      });
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= 70;

    let badgeUnlocked = null;
    let creditsAwarded = 0;

    if (passed) {
      const user = await User.findById(req.user.id);
      
      // Check if user already has a badge for this skill
      // Find or create badge
      let badge = await Badge.findOne({ name: `${quiz.skillName} Certified` });
      if (!badge) {
        badge = await Badge.create({
          name: `${quiz.skillName} Certified`,
          description: `Passed the official ${quiz.skillName} skills verification assessment with a score of ${scorePercentage}%.`,
          icon: 'Award',
          requirements: `Complete the ${quiz.skillName} quiz with a score of 70% or higher.`
        });
      }

      if (!user.badges.includes(badge._id)) {
        user.badges.push(badge._id);
        
        // Award credits (+10)
        creditsAwarded = 10;
        user.credits += creditsAwarded;
        user.xp += 50; // Pass quiz XP
        
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
        
        await user.save();

        // Create transaction audits
        await CreditTransaction.create({
          user: user._id,
          type: 'earn',
          amount: creditsAwarded,
          description: `Earned credits for completing ${quiz.skillName} skills certification`
        });

        // Notifications
        await Notification.create({
          user: user._id,
          title: 'Badge Unlocked!',
          message: `Congratulations! You earned the "${badge.name}" badge.`,
          type: 'achievement'
        });

        await Notification.create({
          user: user._id,
          title: 'Quiz Credits Awarded',
          message: `Earned 10 credits for passing the ${quiz.skillName} quiz.`,
          type: 'credit'
        });

        badgeUnlocked = badge;
      }
    }

    res.status(200).json({
      success: true,
      passed,
      scorePercentage,
      correctCount,
      totalQuestions,
      breakdown,
      badgeUnlocked,
      creditsAwarded
    });
  } catch (error) {
    next(error);
  }
};
