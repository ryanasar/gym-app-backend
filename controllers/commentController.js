import prisma from '../prismaClient.js';

export const getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.query.userId ? parseInt(req.query.userId) : null;

    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        _count: {
          select: { commentLikes: true }
        },
        ...(userId ? {
          commentLikes: {
            where: { userId },
            select: { id: true }
          }
        } : {})
      },
    });

    // Sort: most likes first, then oldest first for ties
    const sorted = comments
      .map(c => ({
        ...c,
        likeCount: c._count.commentLikes,
        isLikedByCurrentUser: userId ? c.commentLikes?.length > 0 : false,
      }))
      .sort((a, b) => {
        if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount;
        return new Date(a.timestamp) - new Date(b.timestamp);
      });

    // Clean up internal fields
    const result = sorted.map(({ _count, commentLikes, ...rest }) => rest);

    res.json(result);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const getCommentsBySplitId = async (req, res) => {
  try {
    const { splitId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { splitId: parseInt(splitId) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const getCommentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { userId: parseInt(userId) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        split: {
          select: {
            id: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        split: {
          select: {
            id: true
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
};

export const createComment = async (req, res) => {
  try {
    // Support both route params and body for postId
    const postId = req.params.postId || req.body.postId;
    const { userId, content, splitId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        userId: parseInt(userId),
        content,
        postId: postId ? parseInt(postId) : null,
        splitId: splitId ? parseInt(splitId) : null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        split: {
          select: {
            id: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: {
        content
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        split: {
          select: {
            id: true
          }
        }
      }
    });

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};