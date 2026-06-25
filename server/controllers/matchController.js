const { calculateMatches } = require('../services/matchingService');

exports.getMatches = async (req, res, next) => {
  try {
    const matches = await calculateMatches(req.user.id);
    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};
