import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据...');

  // 清理现有数据
  await prisma.user.deleteMany();

  // 创建测试用户
  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('123456', 10),
      avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      isActive: true,
      roles: JSON.stringify(['admin', 'user']),
    },
    {
      username: 'user1',
      email: 'user1@example.com',
      password: await bcrypt.hash('123456', 10),
      avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
      isActive: true,
      roles: JSON.stringify(['user']),
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      password: await bcrypt.hash('123456', 10),
      avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
      isActive: true,
      roles: JSON.stringify(['user']),
    },
    {
      username: 'moderator',
      email: 'moderator@example.com',
      password: await bcrypt.hash('123456', 10),
      avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
      isActive: true,
      roles: JSON.stringify(['moderator', 'user']),
    },
    {
      username: 'inactive_user',
      email: 'inactive@example.com',
      password: await bcrypt.hash('123456', 10),
      avatar: null,
      isActive: false,
      roles: JSON.stringify(['user']),
    },
  ];

  // 批量创建用户
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(`创建用户: ${user.username} (ID: ${user.id})`);
  }

  console.log('种子数据完成!');
}

main()
  .catch((error) => {
    console.error('种子数据失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
