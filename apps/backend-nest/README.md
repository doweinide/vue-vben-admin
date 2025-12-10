# Vben Admin Backend (NestJS)

Vben Admin 的 NestJS 后端服务，提供认证授权、RBAC 权限、用户/角色/菜单/部门/上传等功能。基于 NestJS + Prisma + PostgreSQL，使用 Zod 进行请求/响应校验，并集成 Swagger 自动文档。

## 项目结构

```
src/
├── main.ts                          # 应用入口：启动 HTTP、设置前缀/CORS/Swagger/静态资源
├── app.module.ts                    # 根模块：加载配置、Prisma、业务模块与全局拦截/过滤
├── app.controller.ts                # 根控制器：健康检查/示例接口
├── app.service.ts                   # 根服务：提供基础服务能力
├── config/                          # 应用与文档配置
│   ├── app.config.ts                # 端口、API 前缀、CORS、上传目录等
│   ├── database.config.ts           # 数据库配置读取（env），供全局使用
│   ├── openapi.config.ts            # OpenAPI 基本配置与 Schema 注册
│   ├── path-collector.ts            # 运行时收集控制器/方法路径信息
│   ├── swagger-integration.ts       # 基于收集器生成 Swagger 文档
│   └── index.ts                     # 配置导出入口
├── prisma/                          # 数据库访问
│   ├── prisma.module.ts             # 提供 PrismaService 的模块封装
│   └── prisma.service.ts            # Prisma Client 初始化（Edge/Accelerate/本地）
├── decorators/                      # 自定义装饰器
│   ├── api.decorator.ts             # 统一 API 装饰器（路由+文档+Schema 收集）
│   └── zod-param.decorator.ts       # Zod 的 body/query/param 参数验证
├── common/                          # 通用能力
│   ├── index.ts                     # 通用入口导出
│   ├── decorators/
│   │   ├── index.ts
│   │   └── public.decorator.ts      # 标记无需认证的公共路由
│   ├── filters/
│   │   ├── index.ts
│   │   └── http-exception.filter.ts # 全局异常过滤与错误响应格式化
│   ├── guards/
│   │   ├── index.ts
│   │   └── auth.guard.ts            # 自定义认证守卫
│   ├── interceptors/
│   │   ├── index.ts
│   │   └── response.interceptor.ts  # 通用响应拦截（细粒度）
├── interceptors/
│   └── response-format.interceptor.ts# 统一响应体格式拦截与包装
├── schemas/                         # Zod 数据结构定义
│   ├── base/                        # 基础类型、辅助工厂
│   ├── common/                      # 业务通用 Schema（用户/角色/菜单等）
│   │   ├── auth.schema.ts
│   │   ├── department.schema.ts
│   │   ├── menu.schema.ts
│   │   ├── role.schema.ts
│   │   ├── upload.schema.ts
│   │   └── user.schema.ts
│   ├── base/
│   │   ├── base.schema.ts
│   │   └── schema.factory.ts
│   └── index.ts                     # 统一导出入口
├── modules/                          # 业务模块
│   ├── docs/
│   │   └── openapi-generator/       # 从 OpenAPI 生成 TS 类型工具
│   │       ├── openapi-generator.controller.ts
│   │       ├── openapi-generator.module.ts
│   │       └── openapi-generator.service.ts
│   └── system/                      # 系统域模块集合
│       ├── auth/                    # 认证登录、资料接口、用户菜单合并
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       ├── user/                    # 用户 CRUD 与分页
│       │   ├── user.controller.ts
│       │   ├── user.module.ts
│       │   └── user.service.ts
│       ├── role/                    # 角色管理与关联
│       │   ├── role.controller.ts
│       │   ├── role.module.ts
│       │   └── role.service.ts
│       ├── menu/                    # 菜单树与权限点
│       │   ├── menu.controller.ts
│       │   ├── menu.module.ts
│       │   └── menu.service.ts
│       ├── department/              # 部门树与用户关联
│       │   ├── department.controller.ts
│       │   ├── department.module.ts
│       │   └── department.service.ts
│       └── upload/                  # 上传接口与静态文件服务
│           ├── upload.controller.ts
│           ├── upload.module.ts
│           └── upload.service.ts
├── utils/                            # 工具库
│   ├── zod/
│   │   └── z-enhanced.ts            # Zod 增强工具与语法糖
│   └── openApi-to-ts/               # OpenAPI 解析并生成 TS 类型
│       ├── index.ts
│       ├── openapi-parser.ts
│       ├── types/
│       │   └── openapi.d.ts
│       └── typescript-generator.ts
├── test-validation.controller.ts     # Zod 验证示例控制器
└── test-auto-validation.controller.ts# 自动验证示例控制器

prisma/
├── schema.prisma                    # Prisma 主 Schema（自动合并生成）
├── migrations/                      # 数据库迁移文件
├── merge.js                         # 合并 feature schemas 的脚本
├── schemas-feature/                 # 领域拆分的 schema 片段
│   ├── base.prismaFeg
│   ├── department.prismaFeg
│   ├── menu.prismaFeg
│   ├── role.prismaFeg
│   └── user.prismaFeg
└── seed.ts                          # 种子数据脚本
```

## 技术栈

- 框架: NestJS 11.x
- ORM: Prisma 6.x
- 数据库: PostgreSQL（默认，`schema.prisma` 使用 `provider = postgresql`）
- 认证: JWT（`passport-jwt`）
- 校验: Zod + 自定义装饰器（`Api*` + `ZodBody/ZodQuery/ZodParam`）
- 配置: `@nestjs/config`
- 文档: Swagger/OpenAPI（自动收集控制器与 Schema）

## 功能特性

- 认证授权：登录、资料、菜单合并、JWT 守卫
- 用户管理：CRUD、分页、状态、角色关联
- 角色/菜单/部门：树形结构、关联关系、索引优化
- 统一响应、异常过滤、全局前缀与 CORS、静态上传目录

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动数据库（可选，推荐）

在仓库根目录使用内置的 PostgreSQL：

```bash
docker compose up -d postgres
```

默认映射端口 `15432->5432`，数据库 `vben`，用户/密码 `postgres/postgres`。

### 3. 环境配置

在 `apps/backend-nest` 创建 `.env`：

```env
# App
PORT=3333
NODE_ENV=development
API_PREFIX=api
CORS_ORIGIN=*

# Auth
JWT_SECRET=change-me

# Database
DB_CONNECTION=local
DATABASE_URL=postgresql://postgres:postgres@localhost:15432/vben
```

说明：Prisma 客户端初始化依赖 `DB_CONNECTION` 与 `DATABASE_URL`（见 `src/prisma/prisma.service.ts:95`）。本地开发使用 `local`，远端托管（启用 Edge Client + Accelerate）使用 `remote`。

### 4. 初始化数据库

```bash
# 合并 feature schemas 并生成 Prisma Client
pnpm run prisma:generate

# 应用迁移（开发环境）
pnpm run prisma:migrate

# 可选：初始化种子数据
pnpm run prisma:seed
```

### 5. 启动应用

```bash
# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start:prod
```

启动后：

- API 前缀：`http://localhost:3333/api`（见 `src/main.ts:39-41`）
- 文档地址：`http://localhost:3333/docs`（见 `src/main.ts:73-82`）

## 核心接口示例

- 登录：`POST /api/auth/login`
- 个人资料：`GET /api/auth/profile`（需 Bearer Token）
- 用户分页：`GET /api/users?page=1&limit=10`
- 用户详情：`GET /api/users/:id`
- 更新用户：`PATCH /api/users/:id`
- 删除用户：`DELETE /api/users/:id`

所有接口通过 Zod Schema 驱动的装饰器校验与文档生成（例如 `src/decorators/api.decorator.ts`、`src/decorators/zod-param.decorator.ts`）。

## 测试

```bash
pnpm test      # 单元测试
pnpm test:e2e  # 端到端测试
pnpm test:cov  # 覆盖率
```

## 部署

### 容器化运行（示例）

```bash
docker build -t vben-admin-backend .
docker run -d --name vben-admin-backend \
  -p 3333:3333 \
  -e NODE_ENV=production \
  -e API_PREFIX=api \
  -e DB_CONNECTION=local \
  -e DATABASE_URL=postgresql://postgres:postgres@<db-host>:5432/vben \
  -e JWT_SECRET=your_jwt_secret \
  vben-admin-backend
```

`schema.prisma` 使用 PostgreSQL（见 `prisma/schema.prisma:24-27`）。如需改为其他 Provider，请修改数据源并重新迁移。

## 许可证

MIT - 详见 [LICENSE](LICENSE)
