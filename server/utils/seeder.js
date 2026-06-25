const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Badge = require('../models/Badge');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Session = require('../models/Session');
const CreditTransaction = require('../models/CreditTransaction');
const Notification = require('../models/Notification');
const Roadmap = require('../models/Roadmap');

const { calculateMatches } = require('../services/matchingService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Dropping collections...');
    
    await User.deleteMany();
    await Quiz.deleteMany();
    await Badge.deleteMany();
    await Match.deleteMany();
    await Message.deleteMany();
    await Session.deleteMany();
    await CreditTransaction.deleteMany();
    await Notification.deleteMany();
    await Roadmap.deleteMany();

    console.log('Database cleared. Seeding Badges...');
    const badges = await Badge.create([
      {
        name: 'React Certified',
        description: 'Demonstrated complete understanding of React functional components, hooks, and State management.',
        icon: 'ReactIcon',
        requirements: 'Score 70% or higher in the React Skill Assessment.'
      },
      {
        name: 'Node.js Certified',
        description: 'Demonstrated proficiency in server construction, filesystem modules, and asynchronous event loops.',
        icon: 'Server',
        requirements: 'Score 70% or higher in the Node.js Skill Assessment.'
      },
      {
        name: 'CSS Certified',
        description: 'Verified mastery of modern flexbox, CSS Grid layouts, and responsive media styles.',
        icon: 'Layout',
        requirements: 'Score 70% or higher in the CSS Skill Assessment.'
      }
    ]);

    console.log('Seeding Quizzes...');
    const quizzes = await Quiz.create([
      {
        skillName: 'React',
        questions: [
          {
            text: 'What is the latest major version of React released recently in 2024/2025?',
            options: ['React 16', 'React 17', 'React 18', 'React 19'],
            correctAnswer: 3,
            explanation: 'React 19 is the latest major version introducing features like Actions, Server Components, and the use() hook.'
          },
          {
            text: 'Which Hook is used to subscribe to global react states using Zustand?',
            options: ['useState', 'useSyncExternalStore', 'useEffect', 'useReducer'],
            correctAnswer: 1,
            explanation: 'Zustand hook uses useSyncExternalStore internally to subscribe to state changes React 18+.'
          },
          {
            text: 'How can you prevent a component from re-rendering when parent props change if they remain unchanged?',
            options: ['useCallback', 'useMemo', 'React.memo', 'useState'],
            correctAnswer: 2,
            explanation: 'React.memo is a higher-order component that memoizes the output of a component based on shallow comparison of props.'
          }
        ]
      },
      {
        skillName: 'Node.js',
        questions: [
          {
            text: 'Which built-in Node.js module is used to resolve filesystem paths securely across operating systems?',
            options: ['fs', 'path', 'http', 'os'],
            correctAnswer: 1,
            explanation: 'The "path" module provides utilities for working with file and directory paths.'
          },
          {
            text: 'What engine compiles JavaScript execution inside the Node.js runtime environment?',
            options: ['SpiderMonkey', 'Chakra', 'V8', 'JavaScriptCore'],
            correctAnswer: 2,
            explanation: 'Node.js compiles and runs JS code using Google Chrome V8 engine.'
          }
        ]
      },
      {
        skillName: 'CSS',
        questions: [
          {
            text: 'Which CSS property configuration is equivalent to display: flex with item centering on both axes?',
            options: [
              'justify-content: center; align-items: center;',
              'text-align: center; vertical-align: middle;',
              'margin: auto 0;',
              'display: block; margin: auto;'
            ],
            correctAnswer: 0,
            explanation: 'Using justify-content: center and align-items: center in flexbox aligns elements perfectly in the middle.'
          }
        ]
      }
    ]);

    console.log('Seeding Users...');
    // Create users
    const alice = new User({
      name: 'Alice Dev',
      email: 'alice@skillswap.com',
      password: 'password123',
      role: 'Student',
      credits: 20,
      bio: 'Enthusiastic student looking to bridge the gap in React design while sharing Node backend knowledge.',
      skillsOffered: ['Node.js', 'Express', 'MongoDB'],
      skillsWanted: ['React', 'CSS'],
      rating: 4.8,
      streak: 5,
      level: 2,
      xp: 40
    });

    const bob = new User({
      name: 'Bob Code',
      email: 'bob@skillswap.com',
      password: 'password123',
      role: 'Mentor',
      credits: 40,
      bio: 'Professional frontend engineer with 5 years experience specializing in UI transitions and state flows.',
      skillsOffered: ['React', 'CSS', 'Tailwind CSS'],
      skillsWanted: ['Node.js', 'Python'],
      rating: 4.9,
      streak: 12,
      level: 5,
      xp: 120,
      badges: [badges[0]._id, badges[2]._id]
    });

    const charlie = new User({
      name: 'Charlie Tutor',
      email: 'charlie@skillswap.com',
      password: 'password123',
      role: 'Mentor',
      credits: 15,
      bio: 'Fullstack instructor, love teaching Node server architecture and styling structures.',
      skillsOffered: ['CSS', 'JavaScript', 'Node.js'],
      skillsWanted: ['React'],
      rating: 4.2,
      streak: 2,
      level: 1,
      xp: 80,
      badges: [badges[1]._id]
    });

    const admin = new User({
      name: 'Admin Swap',
      email: 'admin@skillswap.com',
      password: 'admin123',
      role: 'Admin',
      credits: 100,
      bio: 'System Administrator.',
      skillsOffered: [],
      skillsWanted: [],
      level: 10,
      xp: 0
    });

    await alice.save();
    await bob.save();
    await charlie.save();
    await admin.save();

    console.log('Users saved. Generating transactions and notifications...');
    await CreditTransaction.create([
      { user: alice._id, type: 'bonus', amount: 20, description: 'Welcome signup reward' },
      { user: bob._id, type: 'bonus', amount: 20, description: 'Welcome signup reward' },
      { user: bob._id, type: 'earn', amount: 20, description: 'Completed coaching sessions' },
      { user: charlie._id, type: 'bonus', amount: 15, description: 'Welcome signup reward' }
    ]);

    await Notification.create([
      { user: alice._id, title: 'Welcome!', message: 'Earn credits by scheduling a session.', type: 'credit' },
      { user: bob._id, title: 'Mentor Match Ready', message: 'You have compatible students waiting!', type: 'match' }
    ]);

    console.log('Creating initial mock Roadmap for Alice...');
    await Roadmap.create({
      user: alice._id,
      title: 'React & Styling Engineering Roadmap',
      targetGoal: 'React Frontend Developer',
      skillsAnalyzed: ['Node.js', 'Express'],
      skillGaps: ['React', 'CSS'],
      weeks: [
        {
          week: 1,
          topic: 'CSS Flexbox & Responsive Styling',
          description: 'Responsive layout designs and Tailwind CSS concepts.',
          resources: [
            { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', type: 'documentation' }
          ],
          milestones: [
            { task: 'Learn media queries', completed: true },
            { task: 'Complete CSS Centering quiz', completed: false }
          ],
          completed: false
        },
        {
          week: 2,
          topic: 'React Functional components',
          description: 'Introduction to hooks and lifecycle updates.',
          resources: [
            { title: 'React Docs', url: 'https://react.dev', type: 'documentation' }
          ],
          milestones: [
            { task: 'Learn useState and useEffect hooks', completed: false }
          ],
          completed: false
        }
      ],
      progress: 50
    });

    console.log('Generating Matches...');
    await calculateMatches(alice._id);
    await calculateMatches(bob._id);
    await calculateMatches(charlie._id);

    console.log('Creating initial chat conversation history...');
    const roomId = [alice._id.toString(), bob._id.toString()].sort().join('--');
    await Message.create([
      {
        sender: alice._id,
        receiver: bob._id,
        text: 'Hi Bob! I noticed you teach React and Tailwind. I would love to learn that!',
        roomId
      },
      {
        sender: bob._id,
        receiver: alice._id,
        text: 'Hello Alice! I can definitely help with React. And I see you know Node.js and Express, which I want to learn. Let\'s do a swap!',
        roomId
      }
    ]);

    console.log('Creating scheduled session...');
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 2); // Scheduled 2 days from now
    await Session.create({
      learner: alice._id,
      mentor: bob._id,
      date: sessionDate,
      duration: 60,
      status: 'scheduled',
      meetingLink: 'https://meet.google.com/skillswap-demo-session'
    });

    console.log('Database seeding successfully completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedData();
