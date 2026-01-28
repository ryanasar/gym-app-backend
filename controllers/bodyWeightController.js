import prisma from '../prismaClient.js';

export const getBodyWeightsByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const entries = await prisma.bodyWeight.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('Error fetching body weight entries:', error);
    res.status(500).json({ error: 'Failed to fetch body weight entries' });
  }
};

export const createBodyWeight = async (req, res) => {
  try {
    const { userId, weight, date } = req.body;

    const parsedUserId = parseInt(userId);
    const parsedWeight = parseFloat(weight);
    const parsedDate = new Date(date);

    const entry = await prisma.bodyWeight.upsert({
      where: {
        userId_date: {
          userId: parsedUserId,
          date: parsedDate,
        },
      },
      update: { weight: parsedWeight },
      create: {
        userId: parsedUserId,
        weight: parsedWeight,
        date: parsedDate,
      },
    });

    res.json(entry);
  } catch (error) {
    console.error('Error creating body weight entry:', error);
    res.status(500).json({ error: 'Failed to create body weight entry' });
  }
};

export const deleteBodyWeight = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.bodyWeight.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting body weight entry:', error);
    res.status(500).json({ error: 'Failed to delete body weight entry' });
  }
};
