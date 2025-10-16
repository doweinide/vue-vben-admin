# Vben Admin Backend (NestJS)

这是 Vben Admin 项目的 NestJS 后端服务，提供完整的用户管理、认证授权等功能。

## 项目结构

```
src/
├── app.controller.ts          # 应用主控制器
├── app.module.ts             # 应用主模块
├── app.service.ts            # 应用主服务
├── main.ts                   # 应用入口文件
├── config/                   # 配置文件
│   ├── app.config.ts         # 应用配置
│   ├── database.config.ts    # 数据库配置
│   └── index.ts              # 配置入口
├── common/                   # 通用模块
│   ├── dto/                  # 数据传输对象
│   │   ├── pagination.dto.ts # 分页 DTO
│   │   ├── response.dto.ts   # 响应 DTO
│   │   └── index.ts
│   ├── filters/              # 异常过滤器
│   │   ├── http-exception.filter.ts
│   │   └── index.ts
│   ├── guards/               # 守卫
│   │   ├── auth.guard.ts     # 认证守卫
│   │   └── index.ts
│   ├── interceptors/         # 拦截器
│   │   ├── response.interceptor.ts # 响应拦截器
│   │   └── index.ts
│   ├── decorators/           # 装饰器
│   │   ├── public.decorator.ts # 公共路由装饰器
│   │   └── index.ts
│   └── index.ts
├── prisma/                   # Prisma 数据库服务
│   ├── prisma.service.ts     # Prisma 服务
│   └── prisma.module.ts      # Prisma 模块
└── modules/                  # 业务模块
    ├── user/                 # 用户模块
    │   ├── dto/
    │   │   ├── create-user.dto.ts
    │   │   ├── update-user.dto.ts
    │   │   └── index.ts
    │   ├── user.controller.ts
    │   ├── user.service.ts
    │   └── user.module.ts
    └── auth/                 # 认证模块
        ├── dto/
        │   ├── login.dto.ts
        │   └── index.ts
        ├── auth.controller.ts
        ├── auth.service.ts
        └── auth.module.ts

prisma/
├── schema.prisma             # Prisma 数据库模式定义
└── migrations/               # 数据库迁移文件
```

## 技术栈

- **框架**: NestJS 11.x
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT
- **验证**: class-validator + class-transformer
- **密码加密**: bcryptjs
- **配置管理**: @nestjs/config
- **API 文档**: Swagger/OpenAPI

## 功能特性

### 🔐 认证授权

- JWT 令牌认证
- 用户登录/注册
- 路由守卫保护
- 公共路由装饰器

### 👥 用户管理

- 用户 CRUD 操作
- 密码加密存储
- 用户状态管理
- 角色权限支持

### 📊 数据处理

- 统一响应格式
- 分页查询支持
- 数据验证管道
- 异常处理过滤器

### ⚙️ 系统配置

- 环境变量配置
- 数据库连接配置
- CORS 跨域支持
- 全局路由前缀

## 快速开始

### 1. 环境准备

确保已安装以下软件：

- Node.js (>= 18.x)
- pnpm

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

创建 `.env` 文件并配置：

```env
# Application Configuration
PORT=3333
NODE_ENV=development
API_PREFIX=api
CORS_ORIGIN=*

# Database Configuration (SQLite)
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
```

### 4. 数据库设置

初始化 Prisma 数据库：

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# (可选) 查看数据库
npx prisma studio
```

### 5. 启动应用

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start:prod
```

应用将在 `http://localhost:3333/api` 启动。

### 6. 访问 API 文档

启动应用后，可以通过以下地址访问 Swagger API 文档：

```
http://localhost:3333/docs
```

## API 文档

### 认证相关

#### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

#### 获取用户信息

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### 用户管理

#### 创建用户

```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "123456",
  "roles": ["user"]
}
```

#### 获取用户列表

```http
GET /api/users?page=1&limit=10
Authorization: Bearer <token>
```

#### 获取用户详情

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### 更新用户

```http
PATCH /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "isActive": true
}
```

#### 删除用户

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### 系统接口

#### 健康检查

```http
GET /api/health
```

## 开发指南

### 添加新模块

1. 在 `src/modules/` 下创建新模块文件夹
2. 创建实体、DTO、服务、控制器和模块文件
3. 在 `app.module.ts` 中导入新模块

### 数据库操作

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库模式更改
npx prisma db push

# 创建迁移文件
npx prisma migrate dev --name migration_name

# 重置数据库
npx prisma migrate reset

# 查看数据库内容
npx prisma studio
```

### 测试

```bash
# 单元测试
pnpm test

# 端到端测试
pnpm test:e2e

# 测试覆盖率
pnpm test:cov
```

## 部署

### Docker 部署

1. 构建镜像：

```bash
docker build -t vben-admin-backend .
```

2. 运行容器：

```bash
docker run -d \
  --name vben-admin-backend \
  -p 3333:3333 \
  -e NODE_ENV=production \
  -e DATABASE_URL="file:./prod.db" \
  -e JWT_SECRET=your_jwt_secret \
  -v $(pwd)/data:/app/data \
  vben-admin-backend
```

### Dockerfile 示例

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3333

# 启动应用
CMD ["pnpm", "start:prod"]
```

### 环境变量

生产环境需要配置的环境变量：

- `NODE_ENV`: 运行环境 (production)
- `PORT`: 服务端口 (默认 3333)
- `API_PREFIX`: API 前缀 (默认 api)
- `CORS_ORIGIN`: CORS 允许的源
- `DATABASE_URL`: 数据库连接字符串 (SQLite 文件路径)
- `JWT_SECRET`: JWT 密钥

### 生产环境数据库

对于生产环境，建议：

1. 使用持久化存储挂载 SQLite 数据库文件
2. 或者修改 `schema.prisma` 使用 PostgreSQL/MySQL：

```prisma
datasource db {
  provider = "postgresql"  // 或 "mysql"
  url      = env("DATABASE_URL")
}
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
