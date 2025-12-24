import prisma from '../prismaClient.js';

export const getWorkoutsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const workouts = await prisma.workout.findMany({
      where: { userId: parseInt(userId) },
      include: {
        exercises: {
          include: {
            template: {
              include: {
                muscles: {
                  include: {
                    muscle: true
                  }
                }
              }
            },
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
};

export const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercises: {
          include: {
            template: {
              include: {
                muscles: {
                  include: {
                    muscle: true
                  }
                }
              }
            },
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const { title, notes, userId } = req.body;

    const workout = await prisma.workout.create({
      data: {
        title,
        notes,
        userId: parseInt(userId)
      },
      include: {
        exercises: {
          include: {
            template: {
              include: {
                muscles: {
                  include: {
                    muscle: true
                  }
                }
              }
            },
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, notes } = req.body;

    const workout = await prisma.workout.update({
      where: { id: parseInt(id) },
      data: {
        title,
        notes
      },
      include: {
        exercises: {
          include: {
            template: {
              include: {
                muscles: {
                  include: {
                    muscle: true
                  }
                }
              }
            },
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    res.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.workout.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
};