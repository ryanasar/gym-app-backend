const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      username: 'testuser',
      name: 'Test User',
      profile: {
        create: {
          bio: 'I love lifting.',
          isPrivate: false,
        },
      },
    },
  });

  // Create a workout for that user with exercises
  const workout = await prisma.workout.create({
    data: {
      title: 'Push Day',
      notes: 'Focus on chest and triceps',
      userId: user.id,
      exercises: {
        create: [
          {
            name: 'Bench Press',
            sets: 4,
            reps: 10,
            weight: 135,
            muscles: {
              create: [
                { muscle: { connectOrCreate: { where: { name: 'Chest' }, create: { name: 'Chest' } } } },
                { muscle: { connectOrCreate: { where: { name: 'Triceps' }, create: { name: 'Triceps' } } } },
              ],
            },
          },
          {
            name: 'Tricep Pushdown',
            sets: 3,
            reps: 12,
            weight: 60,
            muscles: {
              create: [
                { muscle: { connectOrCreate: { where: { name: 'Triceps' }, create: { name: 'Triceps' } } } },
              ],
            },
          },
        ],
      },
    },
  });

  // Create a workout plan for the user
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId: user.id,
      isPublic: true,
      numDays: 3,
      workoutDays: {
        create: [
          {
            dayIndex: 1,
            isRest: false,
            workout: { connect: { id: workout.id } },
          },
          {
            dayIndex: 2,
            isRest: true,
          },
          {
            dayIndex: 3,
            isRest: false,
          },
        ],
      },
    },
  });

  // Create a post
  await prisma.post.create({
    data: {
      title: 'My Push Day Workout',
      description: 'Sharing my push day workout with the community!',
      published: true,
      authorId: user.id,
      workoutId: workout.id,
      workoutPlanId: workoutPlan.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
