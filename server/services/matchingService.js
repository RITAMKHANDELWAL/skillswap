const User = require('../models/User');
const Match = require('../models/Match');

const calculateMatches = async (learnerId) => {
  try {
    const learner = await User.findById(learnerId);
    if (!learner) {
      throw new Error('Learner profile not found');
    }

    // Delete existing matches for this user to rebuild them freshly
    await Match.deleteMany({ learner: learnerId });

    // Fetch potential mentors (excluding current user)
    const potentialMentors = await User.find({ _id: { $ne: learnerId } });
    const matches = [];

    for (const mentor of potentialMentors) {
      // Find intersection of learner's wanted skills and mentor's offered skills
      const skillsMatched = mentor.skillsOffered.filter(skill => 
        learner.skillsWanted.some(w => w.toLowerCase() === skill.toLowerCase())
      );

      if (skillsMatched.length === 0) {
        // Skip if there's zero skill compatibility
        continue;
      }

      // Calculate matching scores
      // Skill overlap weight: 70%, Mentor Rating weight: 20%, Mentor Streak weight: 10%
      const skillsRatio = skillsMatched.length / Math.max(1, learner.skillsWanted.length);
      const skillScore = skillsRatio * 70;
      
      const ratingScore = (mentor.rating / 5) * 20;
      
      const streakBonus = Math.min(10, (mentor.streak || 0) * 1); // Max 10 points bonus for highly active streak

      const rawPercentage = Math.round(skillScore + ratingScore + streakBonus);
      const matchPercentage = Math.min(100, Math.max(10, rawPercentage));
      const matchScore = skillsMatched.length * 10 + Math.round(mentor.rating * 5);

      // Generate helpful explanation notes
      const breakdownReasons = [
        `Teaches ${skillsMatched.join(', ')} which matches your learning goals.`
      ];
      if (mentor.rating >= 4.5) {
        breakdownReasons.push(`Highly rated mentor with ${mentor.rating.toFixed(1)} stars.`);
      }
      if (mentor.streak >= 5) {
        breakdownReasons.push(`Consistent user with a ${mentor.streak}-day learning streak.`);
      }

      const matchObj = new Match({
        learner: learnerId,
        mentor: mentor._id,
        skillsMatched,
        matchScore,
        matchPercentage,
        breakdownReasons
      });

      await matchObj.save();
      matches.push(await matchObj.populate('mentor', 'name email profilePicture bio rating skillsOffered skillsWanted streak'));
    }

    // Sort matches from highest percentage to lowest
    return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  } catch (error) {
    console.error('Matching service error:', error.message);
    return [];
  }
};

module.exports = {
  calculateMatches
};
