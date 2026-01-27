import prisma from '../prismaClient.js';

export const toggleCommentLike = async (req, res) => {
  try {
    const { userId, commentId } = req.body;

    const parsedUserId = parseInt(userId);
    const parsedCommentId = parseInt(commentId);

    // Check if like already exists
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: parsedCommentId,
          userId: parsedUserId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.commentLike.count({
        where: { commentId: parsedCommentId },
      });

      return res.json({ liked: false, likeCount });
    }

    // Like
    await prisma.commentLike.create({
      data: {
        commentId: parsedCommentId,
        userId: parsedUserId,
      },
    });

    const likeCount = await prisma.commentLike.count({
      where: { commentId: parsedCommentId },
    });

    // Get comment to find the author and post
    const comment = await prisma.comment.findUnique({
      where: { id: parsedCommentId },
      select: { userId: true, postId: true },
    });

    const commentAuthorId = comment?.userId;
    const postId = comment?.postId;

    // Check if comment author follows the liker (only notify if they do)
    let shouldNotify = false;
    if (commentAuthorId && commentAuthorId !== parsedUserId) {
      const followRecord = await prisma.follows.findUnique({
        where: {
          followingId_followedById: {
            followedById: commentAuthorId,
            followingId: parsedUserId,
          },
        },
      });
      shouldNotify = !!followRecord;
    }

    return res.json({
      liked: true,
      likeCount,
      commentAuthorId,
      postId,
      shouldNotify,
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ error: 'Failed to toggle comment like' });
  }
};
