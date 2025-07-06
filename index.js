import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import workoutPlanRoutes from './routes/workoutPlanRoutes.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/users', userRoutes);

app.use('/api/posts', postRoutes);

app.use('/api/workoutplans', workoutPlanRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
