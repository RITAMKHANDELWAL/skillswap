const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/auth');

// Controllers
const auth = require('../controllers/authController');
const user = require('../controllers/userController');
const match = require('../controllers/matchController');
const roadmap = require('../controllers/roadmapController');
const session = require('../controllers/sessionController');
const quiz = require('../controllers/quizController');
const chat = require('../controllers/chatController');
const analytics = require('../controllers/analyticsController');

// 1. Auth routes
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', protect, auth.getMe);

// 2. User routes
router.get('/users', protect, user.getUsers);
router.get('/users/profile/:id', protect, user.getUserProfile);
router.put('/users/profile', protect, user.updateProfile);
router.get('/users/notifications', protect, user.getNotifications);
router.put('/users/notifications/read', protect, user.markNotificationsRead);
router.get('/users/transactions', protect, user.getCreditTransactions);

// 3. Match routes
router.get('/matches', protect, match.getMatches);

// 4. Roadmap routes
router.post('/roadmaps', protect, roadmap.createRoadmap);
router.get('/roadmaps', protect, roadmap.getRoadmaps);
router.get('/roadmaps/:id', protect, roadmap.getRoadmapById);
router.put('/roadmaps/:id/milestone', protect, roadmap.updateMilestoneProgress);

// 5. Session routes
router.post('/sessions', protect, session.scheduleSession);
router.get('/sessions', protect, session.getSessions);
router.put('/sessions/:id', protect, session.updateSessionStatus);
router.put('/sessions/:id/review', protect, session.submitReview);

// 6. Quiz routes
router.get('/quizzes', protect, quiz.getQuizzes);
router.get('/quizzes/:skill', protect, quiz.getQuizBySkill);
router.post('/quizzes/:skill/submit', protect, quiz.submitQuizAnswers);

// 7. Chat routes
router.get('/chats', protect, chat.getChatsList);
router.get('/chats/:roomId', protect, chat.getChatMessages);
// Extra endpoint: allow message submission via REST API too
router.post('/chats/message', protect, async (req, res, next) => {
  try {
    const { receiverId, text, roomId } = req.body;
    const msg = await chat.saveDirectMessage(req.user.id, receiverId, text, roomId);
    res.status(201).json({ success: true, message: msg });
  } catch (error) {
    next(error);
  }
});

// 8. Analytics routes
router.get('/analytics/dashboard', protect, analytics.getDashboardAnalytics);
router.get('/analytics/leaderboard', protect, analytics.getLeaderboard);

module.exports = router;
