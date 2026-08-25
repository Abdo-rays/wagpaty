const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { initializeSocket } = require('./sockets/socket');

connectDB();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: '*', 
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000, 
  skip: (req) => req.method === 'GET',
  message: 'طلبات كتير جدًا من الـ IP ده، حاول تاني بعد شوية',
});
app.use('/api', limiter);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is up and running ' });
});


 app.use('/api/auth', require('./modules/auth/auth.route'));
 app.use('/api/admin', require('./modules/admin/admin.route'));
 app.use('/api/restaurants', require('./modules/restaurant/restaurant.route'));
 app.use('/api/notifications', require('./modules/notification/notification.route'));
 app.use('/api/customers', require('./modules/customer/customer.route'));
 app.use('/api/meals', require('./modules/meal/meal.route'));
 app.use('/api/orders', require('./modules/order/order.route'));
 app.use('/api/reviews', require('./modules/review/review.route'));
 app.use('/api/upload', require('./modules/upload/upload.route'));
 app.use('/api/reports', require('./modules/report/report.route'));
 app.use('/api/community', require('./modules/community/community.route'));
 app.use('/api/chat', require('./modules/chat/chat.route'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', credentials: true },
});
app.set('io', io);
initializeSocket(io);

server.listen(PORT, () => {
  console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(` Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});