import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import packageRoutes from './routes/package.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import portfolioRoutes from './routes/portfolio.routes';
import testimonialRoutes from './routes/testimonial.routes';
import faqRoutes from './routes/faq.routes';
import contactRoutes from './routes/contact.routes';
import settingRoutes from './routes/setting.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/auth'),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Silakan coba lagi beberapa menit lagi.',
  },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Fotografi Booking System API is running' });
});

// Auto-run database schema push in production (first run only)
if (process.env.NODE_ENV === 'production') {
  const prismaSchema = path.join(__dirname, '../prisma/schema.prisma');
  
  // Ensure upload directory exists
  fs.mkdirSync(config.upload.dir, { recursive: true });
  
  console.log('📦 Ensuring database schema is up-to-date...');
  try {
    execSync(`npx prisma db push --schema="${prismaSchema}"`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: config.database.url },
    });
    console.log('✅ Database schema synced');
  } catch (err) {
    console.warn('⚠️  Failed to sync database schema:', err);
  }
}

// Serve React client build in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');

  if (fs.existsSync(clientDistPath)) {
    console.log('📦 Serving React client build from:', clientDistPath);
    app.use(express.static(clientDistPath));

    // All non-API routes → React SPA
    app.get('*', (_req, res) => {
      const indexPath = path.join(clientDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ success: false, message: 'Client build not found. Run npm run build first.' });
      }
    });
  } else {
    console.warn('⚠️  Client dist folder not found at', clientDistPath);
    console.warn('   Build the client first: cd apps/client && npm run build');
  }
}

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  const mode = process.env.NODE_ENV || 'development';
  console.log(`🚀 Server running in ${mode} mode on http://localhost:${config.port}`);
  console.log(`📡 API available at http://localhost:${config.port}/api`);
});

export default app;
