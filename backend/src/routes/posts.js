const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const postInclude = {
  author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  comments: {
    include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  },
  likes: { select: { userId: true } },
  _count: { select: { likes: true, comments: true } },
};

// GET /api/posts/feed — posts from self + followed users
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const follows = await prisma.follow.findMany({
      where: { followerId: req.user.id, status: 'accepted' },
      select: { followingId: true },
    });
    const followingIds = follows.map(f => f.followingId);
    const authorIds = [req.user.id, ...followingIds];

    const posts = await prisma.post.findMany({
      where: { authorId: { in: authorIds } },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts — all posts (explore)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts — create post
router.post('/', authenticateToken, async (req, res) => {
  const { content, imageUrl } = req.body;
  if (!content || content.trim() === '')
    return res.status(400).json({ error: 'Content is required' });

  try {
    const post = await prisma.post.create({
      data: { content, imageUrl, authorId: req.user.id },
      include: postInclude,
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: Number(req.params.id) } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.like.deleteMany({ where: { postId: post.id } });
    await prisma.comment.deleteMany({ where: { postId: post.id } });
    await prisma.post.delete({ where: { id: post.id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts/:id/like — toggle like
router.post('/:id/like', authenticateToken, async (req, res) => {
  const postId = Number(req.params.id);
  try {
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: req.user.id, postId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    }
    await prisma.like.create({ data: { userId: req.user.id, postId } });
    res.json({ liked: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const postId = Number(req.params.id);
  const { content } = req.body;
  if (!content || content.trim() === '')
    return res.status(400).json({ error: 'Content is required' });

  try {
    const comment = await prisma.comment.create({
      data: { content, authorId: req.user.id, postId },
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    });
    res.status(201).json(comment);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;