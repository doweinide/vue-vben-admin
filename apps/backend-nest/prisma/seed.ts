// import { PrismaClient } from '@prisma/client/edge';
// import { withAccelerate } from '@prisma/extension-accelerate';
// import * as bcrypt from 'bcryptjs';

// // 手动设置环境变量（如果需要的话）
// if (!process.env.DATABASE_URL) {
//   process.env.DATABASE_URL =
//     'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19wRjZTcVViQ1FjczV0aXJwZWtKWVIiLCJhcGlfa2V5IjoiMDFLODVLWjNNRkY1SlZKMjBHNEI4NkRYRzEiLCJ0ZW5hbnRfaWQiOiJkNzI4ZGEzZWZmZGFkMWZmMjVkNjVlNjlkYjJmZWNhYzg5ZDU2MzE5NjQ2MzJjNmJiNmFkZmFhM2QyNjBlMDIxIiwiaW50ZXJuYWxfc2VjcmV0IjoiNjk0YWRiMWQtMTQ5Ny00N2I3LThlMmItOGViZDFhODI0NjYxIn0.P3xIrurWdXJT93jQZGzOBglyXeCItgIPLRUKiTDlI-Q';
// }

// const prisma = new PrismaClient().$extends(withAccelerate());

// async function main() {
//   console.log('开始种子数据...');

//   // 清理现有数据
//   await prisma.user.deleteMany();

//   // 创建测试用户
//   const users = [
//     {
//       username: 'admin',
//       email: 'admin@example.com',
//       password: await bcrypt.hash('123456', 10),
//       avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
//       isActive: true,
//       roles: JSON.stringify(['admin', 'user']),
//     },
//     {
//       username: 'user1',
//       email: 'user1@example.com',
//       password: await bcrypt.hash('123456', 10),
//       avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
//       isActive: true,
//       roles: JSON.stringify(['user']),
//     },
//     {
//       username: 'user2',
//       email: 'user2@example.com',
//       password: await bcrypt.hash('123456', 10),
//       avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
//       isActive: true,
//       roles: JSON.stringify(['user']),
//     },
//     {
//       username: 'moderator',
//       email: 'moderator@example.com',
//       password: await bcrypt.hash('123456', 10),
//       avatar: 'https://avatars.githubusercontent.com/u/4?v=4',
//       isActive: true,
//       roles: JSON.stringify(['moderator', 'user']),
//     },
//     {
//       username: 'inactive_user',
//       email: 'inactive@example.com',
//       password: await bcrypt.hash('123456', 10),
//       avatar: null,
//       isActive: false,
//       roles: JSON.stringify(['user']),
//     },
//   ];

//   // 批量创建用户
//   for (const userData of users) {
//     const user = await prisma.user.create({
//       data: userData,
//     });
//     console.log(`创建用户: ${user.username} (ID: ${user.id})`);
//   }

//   console.log('种子数据完成!');
// }

// main()
//   .catch((error) => {
//     console.error('种子数据失败:', error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
