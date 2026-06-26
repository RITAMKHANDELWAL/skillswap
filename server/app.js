const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const apiRoutes = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// =======================
// Security Headers
// =======================
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// =======================
// CORS
// =======================
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost',
  'capacitor://localhost',
  'https://localhost',
].filter(Boolean);

console.log('==============================');
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('Allowed Origins:', allowedOrigins);
console.log('==============================');

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Incoming Origin:', origin);

      // Allow Postman, mobile apps, curl, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log('Origin Allowed');
        return callback(null, true);
      }

      console.log('Origin Blocked:', origin);

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// =======================
// Handle OPTIONS Requests
// =======================
app.options('*', cors());

// =======================
// Rate Limiter
// =======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
});

app.use('/api', limiter);

// =======================
// Body Parsing
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =======================
// API Routes
// =======================
app.use('/api', apiRoutes);

// =======================
// Health Check
// =======================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
  });
});

// =======================
// Error Handler
// =======================
app.use(errorHandler);

module.exports = app;