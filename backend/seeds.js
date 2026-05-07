const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const users = [];
  for (let i = 0; i < 10; i++) {
    const username = faker.internet.username().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const hashed = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        username,
        email: faker.internet.email(),
        password: hashed,
        displayName: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        avatarUrl: faker.image.avatar(),
      },
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);
  }

  // Create posts
  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      await prisma.post.create({
        data: {
          content: faker.lorem.sentences(2),
          authorId: user.id,
        },
      });
    }
  }

  // Create some follows
  for (let i = 0; i < users.length; i++) {
    const target = users[(i + 1) % users.length];
    await prisma.follow.create({
      data: { followerId: users[i].id, followingId: target.id, status: 'accepted' },
    });
  }

  console.log('Done! All users have password: password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());