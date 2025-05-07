import express from 'express';
import config from './config/config';
import { notFound, errorHandler } from './middlewares/errorMiddleware';
import authRoutes from './routes/authRoutes';
import videoRoutes from './routes/videoRoutes';

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);

// error handling
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
