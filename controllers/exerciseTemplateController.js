import prisma from '../prismaClient.js';

export const getAllExerciseTemplates = async (req, res) => {
  try {
    const templates = await prisma.exerciseTemplate.findMany({
      include: {
        muscles: {
          include: {
            muscle: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching exercise templates:', error);
    res.status(500).json({ error: 'Failed to fetch exercise templates' });
  }
};

export const getExerciseTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.exerciseTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        muscles: {
          include: {
            muscle: true
          }
        },
        exercises: {
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
    });

    if (!template) {
      return res.status(404).json({ error: 'Exercise template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching exercise template:', error);
    res.status(500).json({ error: 'Failed to fetch exercise template' });
  }
};

export const createExerciseTemplate = async (req, res) => {
  try {
    const { name, description, imageUrl, equipment, difficulty, muscles } = req.body;

    const template = await prisma.exerciseTemplate.create({
      data: {
        name,
        description,
        imageUrl,
        equipment,
        difficulty,
        muscles: muscles ? {
          create: muscles.map(muscleId => ({
            muscleId: parseInt(muscleId)
          }))
        } : undefined
      },
      include: {
        muscles: {
          include: {
            muscle: true
          }
        }
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating exercise template:', error);
    res.status(500).json({ error: 'Failed to create exercise template' });
  }
};

export const updateExerciseTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, equipment, difficulty } = req.body;

    const template = await prisma.exerciseTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        imageUrl,
        equipment,
        difficulty
      },
      include: {
        muscles: {
          include: {
            muscle: true
          }
        }
      }
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating exercise template:', error);
    res.status(500).json({ error: 'Failed to update exercise template' });
  }
};

export const deleteExerciseTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.exerciseTemplate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Exercise template deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise template:', error);
    res.status(500).json({ error: 'Failed to delete exercise template' });
  }
};

export const addMuscleToTemplate = async (req, res) => {
  try {
    const { exerciseTemplateId, muscleId } = req.body;

    const muscleTemplate = await prisma.muscleExerciseTemplate.create({
      data: {
        exerciseTemplateId: parseInt(exerciseTemplateId),
        muscleId: parseInt(muscleId)
      },
      include: {
        muscle: true,
        exerciseTemplate: true
      }
    });

    res.status(201).json(muscleTemplate);
  } catch (error) {
    console.error('Error adding muscle to template:', error);
    res.status(500).json({ error: 'Failed to add muscle to template' });
  }
};

export const removeMuscleFromTemplate = async (req, res) => {
  try {
    const { templateId, muscleId } = req.params;

    await prisma.muscleExerciseTemplate.delete({
      where: {
        muscleId_exerciseTemplateId: {
          muscleId: parseInt(muscleId),
          exerciseTemplateId: parseInt(templateId)
        }
      }
    });

    res.json({ message: 'Muscle removed from template successfully' });
  } catch (error) {
    console.error('Error removing muscle from template:', error);
    res.status(500).json({ error: 'Failed to remove muscle from template' });
  }
};