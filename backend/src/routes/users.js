const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users — list all users except self
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true,
        followers: { where: { followerId: req.user.id }, select: { status: true } },
      },
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:username — profile
router.get('/:username', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, displayName: true, avatarUrl: true, bio: true, createdAt: true,
        posts: {
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            comments: { include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } } },
            likes: { select: { userId: true } },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me — update own profile
router.patch('/me', authenticateToken, async (req, res) => {
  const { displayName, bio, avatarUrl } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName, bio, avatarUrl },
      select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;