import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Create the main user with profile
    const ryanUser = await prisma.user.create({
      data: {
        email: 'ryanasar05@gmail.com',
        name: 'Ryan Asar',
        username: 'ryanasar',
        profile: {
          create: {
            bio: 'Fitness enthusiast 💪 | Gym lover | Sharing my workout journey',
            isPrivate: false,
          }
        }
      }
    });

    // Create additional users for followers/following
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'john.doe@gmail.com',
          name: 'John Doe',
          username: 'johndoe',
          profile: {
            create: {
              bio: 'John\'s fitness journey',
              isPrivate: false,
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: 'jane.smith@gmail.com',
          name: 'Jane Smith',
          username: 'janesmith',
          profile: {
            create: {
              bio: 'Jane\'s profile',
              isPrivate: false,
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: 'mike.wilson@gmail.com',
          name: 'Mike Wilson',
          username: 'mikew',
          profile: {
            create: {
              bio: 'Mike\'s workouts',
              isPrivate: false,
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: 'sarah.johnson@gmail.com',
          name: 'Sarah Johnson',
          username: 'sarahj',
          profile: {
            create: {
              bio: 'Sarah\'s fitness',
              isPrivate: true,
            }
          }
        }
      }),
      prisma.user.create({
        data: {
          email: 'alex.brown@gmail.com',
          name: 'Alex Brown',
          username: 'alexb',
          profile: {
            create: {
              bio: 'Alex\'s gym life',
              isPrivate: false,
            }
          }
        }
      })
    ]);

    const [john, jane, mike, sarah, alex] = users;

    // Create follow relationships
    await Promise.all([
      // Ryan follows others
      prisma.follows.create({
        data: {
          followedById: ryanUser.id,
          followingId: john.id,
        }
      }),
      prisma.follows.create({
        data: {
          followedById: ryanUser.id,
          followingId: jane.id,
        }
      }),
      prisma.follows.create({
        data: {
          followedById: ryanUser.id,
          followingId: mike.id,
        }
      }),
      // Others follow Ryan
      prisma.follows.create({
        data: {
          followedById: john.id,
          followingId: ryanUser.id,
        }
      }),
      prisma.follows.create({
        data: {
          followedById: jane.id,
          followingId: ryanUser.id,
        }
      }),
      prisma.follows.create({
        data: {
          followedById: sarah.id,
          followingId: ryanUser.id,
        }
      }),
      prisma.follows.create({
        data: {
          followedById: alex.id,
          followingId: ryanUser.id,
        }
      })
    ]);

    // Create workouts for Ryan
    const workouts = await Promise.all([
      prisma.workout.create({
        data: {
          title: 'Push Day - Chest & Triceps',
          notes: 'Great workout today, felt strong on bench press',
          userId: ryanUser.id,
          exercises: {
            create: [
              { name: 'Bench Press', sets: 4, reps: 8, weight: 185 },
              { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 70 },
              { name: 'Tricep Dips', sets: 3, reps: 12, weight: 25 },
              { name: 'Push-ups', sets: 2, reps: 15, weight: 0 }
            ]
          }
        }
      }),
      prisma.workout.create({
        data: {
          title: 'Pull Day - Back & Biceps',
          notes: 'New PR on deadlifts!',
          userId: ryanUser.id,
          exercises: {
            create: [
              { name: 'Deadlifts', sets: 4, reps: 5, weight: 225 },
              { name: 'Pull-ups', sets: 3, reps: 8, weight: 15 },
              { name: 'Barbell Rows', sets: 3, reps: 10, weight: 135 },
              { name: 'Bicep Curls', sets: 3, reps: 12, weight: 40 }
            ]
          }
        }
      }),
      prisma.workout.create({
        data: {
          title: 'Leg Day',
          notes: 'Legs are feeling it today',
          userId: ryanUser.id,
          exercises: {
            create: [
              { name: 'Squats', sets: 4, reps: 8, weight: 205 },
              { name: 'Romanian Deadlifts', sets: 3, reps: 10, weight: 155 },
              { name: 'Leg Press', sets: 3, reps: 15, weight: 315 },
              { name: 'Calf Raises', sets: 4, reps: 20, weight: 45 }
            ]
          }
        }
      })
    ]);

    // Create workout plans for Ryan
    const workoutPlans = await Promise.all([
      prisma.workoutPlan.create({
        data: {
          userId: ryanUser.id,
          isPublic: true,
          numDays: 6,
          workoutDays: {
            create: [
              { dayIndex: 0, isRest: false, workoutId: workouts[0].id },
              { dayIndex: 1, isRest: false, workoutId: workouts[1].id },
              { dayIndex: 2, isRest: false, workoutId: workouts[2].id },
              { dayIndex: 3, isRest: false, workoutId: workouts[0].id },
              { dayIndex: 4, isRest: false, workoutId: workouts[1].id },
              { dayIndex: 5, isRest: true }
            ]
          }
        }
      }),
      prisma.workoutPlan.create({
        data: {
          userId: ryanUser.id,
          isPublic: true,
          numDays: 4,
          workoutDays: {
            create: [
              { dayIndex: 0, isRest: false, workoutId: workouts[0].id },
              { dayIndex: 1, isRest: false, workoutId: workouts[1].id },
              { dayIndex: 2, isRest: true },
              { dayIndex: 3, isRest: false, workoutId: workouts[2].id }
            ]
          }
        }
      })
    ]);

    // Create achievements for Ryan
    const achievements = await Promise.all([
      prisma.achievement.create({
        data: {
          userId: ryanUser.id,
          workoutId: workouts[1].id // The deadlift PR workout
        }
      }),
      prisma.achievement.create({
        data: {
          userId: ryanUser.id,
          workoutId: workouts[0].id
        }
      })
    ]);

    // Create posts for Ryan
    const posts = await Promise.all([
      prisma.post.create({
        data: {
          title: 'New Deadlift PR! 🔥',
          description: 'Just hit 225lbs for 5 reps on deadlifts! Feeling stronger every day. The key was really focusing on my form and progressive overload.',
          published: true,
          authorId: ryanUser.id,
          workoutId: workouts[1].id,
          achievementId: achievements[0].id
        }
      }),
      prisma.post.create({
        data: {
          title: 'New Push/Pull/Legs Program',
          description: 'Starting a new 6-day PPL split. Really excited to see how this goes! The volume is higher than what I\'m used to but I think I\'m ready for it.',
          published: true,
          authorId: ryanUser.id,
          workoutPlanId: workoutPlans[0].id
        }
      }),
      prisma.post.create({
        data: {
          title: 'Consistency is Key',
          description: 'Been hitting the gym consistently for 3 months now. The results are starting to show! Remember, it\'s not about perfect workouts, it\'s about showing up.',
          published: true,
          authorId: ryanUser.id
        }
      }),
      prisma.post.create({
        data: {
          title: 'Leg Day Complete ✅',
          description: 'Another brutal leg session in the books. Squats felt heavy today but pushed through. Recovery meal is definitely earned!',
          published: true,
          authorId: ryanUser.id,
          workoutId: workouts[2].id
        }
      })
    ]);

    // Add likes and comments to posts
    await Promise.all([
      // Likes on Ryan's posts
      prisma.like.create({
        data: { userId: john.id, postId: posts[0].id }
      }),
      prisma.like.create({
        data: { userId: jane.id, postId: posts[0].id }
      }),
      prisma.like.create({
        data: { userId: mike.id, postId: posts[1].id }
      }),
      prisma.like.create({
        data: { userId: sarah.id, postId: posts[2].id }
      }),
      prisma.like.create({
        data: { userId: alex.id, postId: posts[3].id }
      }),

      // Comments on Ryan's posts
      prisma.comment.create({
        data: {
          userId: john.id,
          content: 'Awesome job on the PR! 💪',
          postId: posts[0].id
        }
      }),
      prisma.comment.create({
        data: {
          userId: jane.id,
          content: 'That\'s incredible! What\'s your secret?',
          postId: posts[0].id
        }
      }),
      prisma.comment.create({
        data: {
          userId: mike.id,
          content: 'PPL is such a solid program. Good luck!',
          postId: posts[1].id
        }
      }),
      prisma.comment.create({
        data: {
          userId: sarah.id,
          content: 'So true! Consistency beats perfection every time.',
          postId: posts[2].id
        }
      })
    ]);

    // Add likes to workout plans
    await Promise.all([
      prisma.like.create({
        data: { userId: john.id, workoutPlanId: workoutPlans[0].id }
      }),
      prisma.like.create({
        data: { userId: jane.id, workoutPlanId: workoutPlans[0].id }
      }),
      prisma.like.create({
        data: { userId: mike.id, workoutPlanId: workoutPlans[1].id }
      })
    ]);

    // Add comments to workout plans
    await Promise.all([
      prisma.comment.create({
        data: {
          userId: alex.id,
          content: 'This looks like a great program! Mind if I try it?',
          workoutPlanId: workoutPlans[0].id
        }
      }),
      prisma.comment.create({
        data: {
          userId: john.id,
          content: 'Nice split! How long have you been running this?',
          workoutPlanId: workoutPlans[1].id
        }
      })
    ]);

    console.log('✅ Test data created successfully!');
    console.log(`User: ${ryanUser.email} (ID: ${ryanUser.id})`);
    console.log(`Created ${workouts.length} workouts`);
    console.log(`Created ${workoutPlans.length} workout plans`);
    console.log(`Created ${posts.length} posts`);
    console.log(`Created ${achievements.length} achievements`);
    console.log('Created follow relationships and interactions');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestData();