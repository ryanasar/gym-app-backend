import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import splitRoutes from './routes/splitRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import workoutRoutes from './routes/workouts.js';
import workoutSessionRoutes from './routes/workoutSessionRoutes.js';
import exerciseRoutes from './routes/excercises.js';
import exerciseTemplateRoutes from './routes/exerciseTemplateRoutes.js';
import muscleRoutes from './routes/muscleRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import savedWorkoutRoutes from './routes/savedWorkoutRoutes.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use("/api/auth", authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/posts', postRoutes);

app.use('/api/splits', splitRoutes);

app.use('/api/profiles', profileRoutes);

app.use('/api/workouts', workoutRoutes);

app.use('/api/workout-sessions', workoutSessionRoutes);

app.use('/api/exercises', exerciseRoutes);

app.use('/api/exercise-templates', exerciseTemplateRoutes);

app.use('/api/muscles', muscleRoutes);

app.use('/api/comments', commentRoutes);

app.use('/api/likes', likeRoutes);

app.use('/api/achievements', achievementRoutes);

app.use('/api/saved-workouts', savedWorkoutRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
