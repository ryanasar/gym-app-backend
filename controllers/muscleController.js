import prisma from '../prismaClient.js';

export const getAllMuscles = async (req, res) => {
  try {
    const muscles = await prisma.muscle.findMany({
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                workoutId: true,
                sets: true,
                reps: true,
                weight: true,
                template: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(muscles);
  } catch (error) {
    console.error('Error fetching muscles:', error);
    res.status(500).json({ error: 'Failed to fetch muscles' });
  }
};

export const getMuscleById = async (req, res) => {
  try {
    const { id } = req.params;
    const muscle = await prisma.muscle.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercises: {
          include: {
            exercise: {
              include: {
                workout: {
                  select: {
                    id: true,
                    title: true,
                    userId: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!muscle) {
      return res.status(404).json({ error: 'Muscle not found' });
    }

    res.json(muscle);
  } catch (error) {
    console.error('Error fetching muscle:', error);
    res.status(500).json({ error: 'Failed to fetch muscle' });
  }
};

export const createMuscle = async (req, res) => {
  try {
    const { name } = req.body;

    const muscle = await prisma.muscle.create({
      data: {
        name
      }
    });

    res.status(201).json(muscle);
  } catch (error) {
    console.error('Error creating muscle:', error);
    res.status(500).json({ error: 'Failed to create muscle' });
  }
};

export const updateMuscle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const muscle = await prisma.muscle.update({
      where: { id: parseInt(id) },
      data: {
        name
      }
    });

    res.json(muscle);
  } catch (error) {
    console.error('Error updating muscle:', error);
    res.status(500).json({ error: 'Failed to update muscle' });
  }
};

export const deleteMuscle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.muscle.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Muscle deleted successfully' });
  } catch (error) {
    console.error('Error deleting muscle:', error);
    res.status(500).json({ error: 'Failed to delete muscle' });
  }
};