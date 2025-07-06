import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create user
  const user = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      email: 'testuser@example.com',
      username: 'testuser',
      name: 'Test User',
      profile: {
        create: {
          bio: 'Sample bio for testuser',
          isPrivate: false,
        },
      },
    },
  });

  // Create workout
  const workout = await prisma.workout.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Push Day Workout',
      notes: 'Focus on chest and triceps.',
      userId: user.id,
      exercises: {
        create: [
          {
            name: 'Bench Press',
            sets: 4,
            reps: 8,
            weight: 185,
          },
          {
            name: 'Incline Dumbbell Press',
            sets: 3,
            reps: 10,
            weight: 60,
          },
          {
            name: 'Tricep Pushdown',
            sets: 3,
            reps: 12,
            weight: 50,
          },
        ],
      },
    },
    include: {
      exercises: true,
    },
  });

  // Create workout plan with 7 days
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId: user.id,
      isPublic: true,
      numDays: 7,
      workoutDays: {
        create: Array.from({ length: 7 }, (_, i) => ({
          dayIndex: i,
          isRest: false,
          workoutId: workout.id,
        })),
      },
    },
    include: {
      workoutDays: {
        include: {
          workout: {
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  });

  // Create post referencing workout
  const post = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Great Push Day Session!',
      description: 'Hit a PR on bench press today.',
      published: true,
      authorId: user.id,
      workoutId: workout.id,
    },
  });

  // Create like
  await prisma.like.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user.id,
      postId: post.id,
    },
  });

  // Create comment
  await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: user.id,
      content: 'Felt really strong today!',
      postId: post.id,
    },
  });

  console.log('✅ Seed data created for testuser including a 7-day workout plan');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
