const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/follows/:userId — send follow request
router.post('/:userId', authenticateToken, async (req, res) => {
  const followingId = Number(req.params.userId);
  if (followingId === req.user.id)
    return res.status(400).json({ error: "You can't follow yourself" });

  try {
    const follow = await prisma.follow.create({
      data: { followerId: req.user.id, followingId, status: 'accepted' },
      // For simplicity we auto-accept; change to 'pending' if you want request flow
    });
    res.status(201).json(follow);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Already following' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/follows/:userId — unfollow
router.delete('/:userId', authenticateToken, async (req, res) => {
  const followingId = Number(req.params.userId);
  try {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: req.user.id, followingId } },
    });
    res.json({ message: 'Unfollowed' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/follows/requests — incoming pending requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.follow.findMany({
      where: { followingId: req.user.id, status: 'pending' },
      include: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;