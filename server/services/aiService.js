const http = require('https');

// Predefined roadmap templates for fallbacks
const TEMPLATES = {
  frontend: {
    title: 'Frontend Engineering Masterclass',
    skillsAnalyzed: ['HTML', 'CSS', 'JavaScript'],
    skillGaps: ['React', 'Zustand', 'Tailwind CSS', 'Vite & Bundlers', 'API Integration'],
    weeks: [
      {
        week: 1,
        topic: 'Modern CSS & Responsive Layouts',
        description: 'Deep dive into Flexbox, Grid, Custom Properties, and Tailwind CSS configuration.',
        resources: [
          { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', type: 'documentation' },
          { title: 'CSS Grid Guide', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'article' }
        ],
        milestones: [
          { task: 'Build a responsive glassmorphic dashboard landing page', completed: false },
          { task: 'Master CSS media queries and mobile-first principles', completed: false }
        ]
      },
      {
        week: 2,
        topic: 'Advanced JavaScript & React 19 Core',
        description: 'Understand closures, async/await, DOM rendering, React components, props, state, and hooks.',
        resources: [
          { title: 'React 19 Documentation', url: 'https://react.dev', type: 'documentation' },
          { title: 'Eloquent JavaScript Book', url: 'https://eloquentjavascript.net/', type: 'book' }
        ],
        milestones: [
          { task: 'Create a state-driven task management application', completed: false },
          { task: 'Implement custom hooks for handling fetch requests', completed: false }
        ]
      },
      {
        week: 3,
        topic: 'Global State Management & Performance',
        description: 'Integrate Zustand for decoupled global state, memoization, and lazy loading.',
        resources: [
          { title: 'Zustand GitHub Docs', url: 'https://github.com/pmndrs/zustand', type: 'documentation' },
          { title: 'React Performance Auditing', url: 'https://react.dev/reference/react/memo', type: 'article' }
        ],
        milestones: [
          { task: 'Migrate local storage state to a global Zustand store', completed: false },
          { task: 'Optimize bundle size using React.lazy and Suspense', completed: false }
        ]
      },
      {
        week: 4,
        topic: 'API Integrations & WebSocket Gateways',
        description: 'Fetch data via Axios, handle error boundaries, and configure Socket.io-client connections.',
        resources: [
          { title: 'Axios API Client Reference', url: 'https://axios-http.com', type: 'documentation' },
          { title: 'Socket.io Client Guidelines', url: 'https://socket.io/docs/v4/client-api/', type: 'article' }
        ],
        milestones: [
          { task: 'Connect frontend dashboard to a backend REST API', completed: false },
          { task: 'Establish a real-time messaging window in the app', completed: false }
        ]
      }
    ]
  },
  backend: {
    title: 'Robust Backend & Systems Design',
    skillsAnalyzed: ['JavaScript', 'Node.js'],
    skillGaps: ['Express', 'MongoDB & Mongoose', 'Socket.io', 'JWT Auth Flow', 'REST APIs'],
    weeks: [
      {
        week: 1,
        topic: 'Node.js & Express App Architecture',
        description: 'Configure clean folder structures, standard middlewares, rate limiters, and error handling.',
        resources: [
          { title: 'Express.js Getting Started', url: 'https://expressjs.com', type: 'documentation' },
          { title: 'Node.js Best Practices', url: 'https://github.com/goldbergyoni/nodebestpractices', type: 'article' }
        ],
        milestones: [
          { task: 'Build an Express server with a structured router and error boundary middleware', completed: false }
        ]
      },
      {
        week: 2,
        topic: 'Database Schemas & Modeling (MongoDB)',
        description: 'Design Mongoose schemas, indexes, hooks, and complex aggregate query pipelines.',
        resources: [
          { title: 'Mongoose Schemas Guide', url: 'https://mongoosejs.com/docs/guide.html', type: 'documentation' }
        ],
        milestones: [
          { task: 'Design a relational model structure (User, Session, Transactions) with Mongoose', completed: false }
        ]
      },
      {
        week: 3,
        topic: 'Secure Authentication & Auths',
        description: 'Learn Bcrypt hashing, JSON Web Tokens (JWT), refresh tokens, and cookie parsing.',
        resources: [
          { title: 'JWT Intro & Best Practices', url: 'https://jwt.io/introduction', type: 'article' }
        ],
        milestones: [
          { task: 'Deploy cookie-based JWT verification middleware with role verification guards', completed: false }
        ]
      },
      {
        week: 4,
        topic: 'WebSockets & Event-Driven Flows',
        description: 'Configure Socket.io to manage room creation, chat alerts, and heartbeat monitoring.',
        resources: [
          { title: 'Socket.io Server Core API', url: 'https://socket.io/docs/v4/server-api/', type: 'documentation' }
        ],
        milestones: [
          { task: 'Develop active user state tracking and room broadcasts via events', completed: false }
        ]
      }
    ]
  }
};

const getAIMockRoadmap = (targetGoal, currentSkills = []) => {
  const goalLower = targetGoal.toLowerCase();
  let baseTemplate;

  if (goalLower.includes('front') || goalLower.includes('react') || goalLower.includes('web')) {
    baseTemplate = { ...TEMPLATES.frontend };
  } else if (goalLower.includes('back') || goalLower.includes('node') || goalLower.includes('api')) {
    baseTemplate = { ...TEMPLATES.backend };
  } else {
    // Dynamic default template if it matches nothing specifically
    baseTemplate = {
      title: `Specialized Roadmap for ${targetGoal}`,
      skillsAnalyzed: currentSkills.length > 0 ? currentSkills : ['General Programming Concepts'],
      skillGaps: [`Advanced ${targetGoal} Frameworks`, 'Integration Tactics', 'Optimization', 'Production Deployment'],
      weeks: [
        {
          week: 1,
          topic: `Foundations of ${targetGoal}`,
          description: `Master fundamental syntaxes, tooling, and architectures required for ${targetGoal}.`,
          resources: [{ title: `${targetGoal} Getting Started Docs`, url: 'https://google.com', type: 'documentation' }],
          milestones: [{ task: `Set up local environments and compile initial hello-world tests`, completed: false }]
        },
        {
          week: 2,
          topic: `Intermediate Features & Structures`,
          description: 'Focus on database configurations, system structures, and patterns.',
          resources: [{ title: `Structured Guides on ${targetGoal}`, url: 'https://google.com', type: 'article' }],
          milestones: [{ task: `Implement mid-tier modular libraries and core features`, completed: false }]
        },
        {
          week: 3,
          topic: `Testing & Performance Benchmarking`,
          description: `Validate execution times, set up automated tests, and trace error handling flows for ${targetGoal}.`,
          resources: [{ title: 'Testing Techniques and Strategies', url: 'https://google.com', type: 'article' }],
          milestones: [{ task: 'Write unit tests validating core components', completed: false }]
        },
        {
          week: 4,
          topic: 'Deployment & Scaling Strategies',
          description: 'Prepare production-ready builds, Docker orchestration, and hosting deployments.',
          resources: [{ title: 'Deployment Practices', url: 'https://google.com', type: 'documentation' }],
          milestones: [{ task: 'Orchestrate build scripts using Docker containers', completed: false }]
        }
      ]
    };
  }

  // Remove already possessed skills from skillGaps
  baseTemplate.skillGaps = baseTemplate.skillGaps.filter(
    gap => !currentSkills.some(skill => skill.toLowerCase() === gap.toLowerCase())
  );

  return baseTemplate;
};

// Generates learning roadmaps using OpenAI API (or falls back to mock)
const generateRoadmap = async (targetGoal, currentSkills = []) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('No OpenAI API key found, generating template fallback roadmap.');
    return getAIMockRoadmap(targetGoal, currentSkills);
  }

  try {
    const prompt = `Generate a customized 4-week learning roadmap to achieve the goal: "${targetGoal}". 
The user already knows: ${JSON.stringify(currentSkills)}.
Provide the output in JSON format with these exact fields:
{
  "title": "String - title of the roadmap",
  "skillsAnalyzed": ["String - current skills recognized"],
  "skillGaps": ["String - skill gaps noticed"],
  "weeks": [
    {
      "week": 1,
      "topic": "String - week topic",
      "description": "String - brief week description",
      "resources": [{"title": "String", "url": "String", "type": "String: video/article/book/course/documentation"}],
      "milestones": [{"task": "String - task to complete", "completed": false}]
    }
  ]
}`;

    const roadmapJson = await makeOpenAICall(prompt, apiKey);
    return JSON.parse(roadmapJson);
  } catch (error) {
    console.error('OpenAI Roadmap API call failed, using mock generator instead:', error.message);
    return getAIMockRoadmap(targetGoal, currentSkills);
  }
};

// Generates session summaries using OpenAI API (or falls back to mock)
const generateSessionSummary = async (mentorName, learnerName, date, notes) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('No OpenAI API key found, generating static session summary.');
    return `In this mentorship session, Mentor ${mentorName} met with Learner ${learnerName} on ${new Date(date).toLocaleDateString()}. Key topics discussed: ${notes || 'Skill exchange details, code review, and Q&A'}. Recommended next steps: Practice weekly milestone tasks and review documentation resources.`;
  }

  try {
    const prompt = `Write a short 2-3 sentence AI summary of a mentorship session between mentor ${mentorName} and student ${learnerName} based on the session notes: "${notes}"`;
    const summary = await makeOpenAICall(prompt, apiKey, 0.7, 150);
    return summary.trim();
  } catch (error) {
    console.error('OpenAI Summary API call failed, using mock generator:', error.message);
    return `Session on ${new Date(date).toLocaleDateString()} between ${mentorName} and ${learnerName}. Notes summarized: ${notes || 'Reviewed goals and next steps.'}`;
  }
};

// Helper function to make HTTP post requests to OpenAI API
function makeOpenAICall(prompt, apiKey, temperature = 0.5, maxTokens = 1500) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature,
      max_tokens: maxTokens,
      response_format: prompt.includes('JSON') ? { type: 'json_object' } : undefined
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed.choices[0].message.content);
          } catch (e) {
            reject(new Error('Failed to parse OpenAI JSON response'));
          }
        } else {
          reject(new Error(`OpenAI API returned status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

module.exports = {
  generateRoadmap,
  generateSessionSummary
};
