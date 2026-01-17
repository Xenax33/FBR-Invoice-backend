import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import hsCodeRoutes from './routes/hsCodeRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import scenarioAdminRoutes from './routes/scenarioAdminRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'FBR Invoice Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/buyers', buyerRoutes);
app.use('/api/v1/hs-codes', hsCodeRoutes);
app.use('/api/v1/scenarios', scenarioRoutes);
app.use('/api/v1/admin/scenarios', scenarioAdminRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
