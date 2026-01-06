import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');

    // Check if testuser already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'testuser' }
    });

    if (existingUser) {
      console.log('Test user already exists. Deleting and recreating...');
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
    }

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        supabaseId: 'test-supabase-id-123',
        name: 'Test User',
        username: 'testuser',
        hasCompletedOnboarding: true,
        profile: {
          create: {
            bio: 'Just a test user for development. Follow me to test the following feed!',
            isPrivate: false
          }
        }
      }
    });

    console.log('Test user created:', testUser);

    // Create sample workout sessions
    console.log('Creating sample workout sessions...');

    const workoutSession1 = await prisma.workoutSession.create({
      data: {
        userId: testUser.id,
        dayName: 'Push Day',
        weekNumber: 1,
        dayNumber: 1,
        completedAt: new Date(),
        exercises: {
          create: [
            {
              exerciseName: 'Bench Press',
              orderIndex: 0,
              sets: {
                create: [
                  { setNumber: 1, weight: 135, reps: 10, completed: true },
                  { setNumber: 2, weight: 155, reps: 8, completed: true },
                  { setNumber: 3, weight: 175, reps: 6, completed: true }
                ]
              }
            },
            {
              exerciseName: 'Overhead Press',
              orderIndex: 1,
              sets: {
                create: [
                  { setNumber: 1, weight: 95, reps: 10, completed: true },
                  { setNumber: 2, weight: 105, reps: 8, completed: true },
                  { setNumber: 3, weight: 115, reps: 6, completed: true }
                ]
              }
            }
          ]
        }
      }
    });

    const workoutSession2 = await prisma.workoutSession.create({
      data: {
        userId: testUser.id,
        dayName: 'Pull Day',
        weekNumber: 1,
        dayNumber: 2,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        exercises: {
          create: [
            {
              exerciseName: 'Deadlift',
              orderIndex: 0,
              sets: {
                create: [
                  { setNumber: 1, weight: 225, reps: 8, completed: true },
                  { setNumber: 2, weight: 245, reps: 6, completed: true },
                  { setNumber: 3, weight: 265, reps: 4, completed: true }
                ]
              }
            },
            {
              exerciseName: 'Pull-ups',
              orderIndex: 1,
              sets: {
                create: [
                  { setNumber: 1, reps: 12, completed: true },
                  { setNumber: 2, reps: 10, completed: true },
                  { setNumber: 3, reps: 8, completed: true }
                ]
              }
            }
          ]
        }
      }
    });

    console.log('Workout sessions created');

    // Create sample posts
    console.log('Creating sample posts...');

    const post1 = await prisma.post.create({
      data: {
        authorId: testUser.id,
        title: 'Push Day',
        description: 'Great chest and shoulder workout today! Hit a new PR on bench press 💪',
        published: true,
        workoutSessionId: workoutSession1.id,
        streak: 3
      }
    });

    const post2 = await prisma.post.create({
      data: {
        authorId: testUser.id,
        title: 'Pull Day',
        description: 'Deadlifts felt amazing today. Form is getting better every week!',
        published: true,
        workoutSessionId: workoutSession2.id,
        streak: 2
      }
    });

    console.log('Sample posts created');

    console.log('\n✅ Test user setup complete!');
    console.log('Username: testuser');
    console.log('User ID:', testUser.id);
    console.log('Posts created: 2');
    console.log('\nYou can now:');
    console.log('1. Search for "testuser" in the Explore tab');
    console.log('2. Follow the user');
    console.log('3. See their posts in the Following tab');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
