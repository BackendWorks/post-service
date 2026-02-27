# post-service

[![CI](https://github.com/BackendWorks/post-service/actions/workflows/ci.yml/badge.svg)](https://github.com/BackendWorks/post-service/actions/workflows/ci.yml)
[![Tests](https://github.com/BackendWorks/post-service/actions/workflows/test.yml/badge.svg)](https://github.com/BackendWorks/post-service/actions/workflows/test.yml)

NestJS post management microservice. Full CRUD for posts with gRPC-based JWT authentication (no Passport — token validation is delegated to `auth-service` via gRPC on every protected request).

## Responsibilities

- Create, read, update, and soft-delete posts
- Validate Bearer tokens via `auth-service` gRPC (`ValidateToken`)
- Enrich post responses with author data fetched from `auth-service`
- Expose a gRPC server for async `post-worker` jobs
- Paginated, searchable post listing

## Ports

| Protocol | Address |
|---|---|
| HTTP | `:9002` |
| gRPC | `:50052` |

## Tech Stack

NestJS 11 · TypeScript · PostgreSQL · Prisma (via `@backendworks/post-db`) · Redis · gRPC (`nestjs-grpc`) · Swagger · nestjs-i18n · Jest

## Getting Started

```bash
npm install
npm run dev       # proto:generate → nest start --watch
```

> After editing any `.proto` file run `npm run proto:generate` manually, or just restart `npm run dev`.

## Environment Variables

```env
NODE_ENV=local
APP_NAME=@backendworks/post
APP_PORT=9002
APP_CORS_ORIGINS=*
APP_DEBUG=true

DATABASE_URL=postgresql://admin:master123@localhost:5432/postgres?schema=public

ACCESS_TOKEN_SECRET_KEY=your-access-secret

REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=post:
REDIS_TTL=3600

GRPC_URL=0.0.0.0:50052
GRPC_PACKAGE=post
GRPC_AUTH_URL=0.0.0.0:50051
GRPC_AUTH_PACKAGE=auth
```

> `auth-service` must be running and reachable at `GRPC_AUTH_URL` before starting this service.

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/post` | List posts (paginated, searchable) |
| `GET` | `/health` | Health check |

### Protected (Bearer token)

| Method | Path | Description |
|---|---|---|
| `POST` | `/post` | Create post |
| `GET` | `/post/:id` | Get post by ID |
| `PATCH` | `/post/:id` | Update post |
| `DELETE` | `/post/:id` | Soft-delete post |

Query params for `GET /post`: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `authorId`.

Swagger docs available at `http://localhost:9002/docs`.

## gRPC

Proto files: `src/protos/post.proto`, `src/protos/auth.proto`
Generated types: `src/generated/` — **do not edit manually**

```protobuf
service PostService {
  rpc CreatePost (CreatePostRequest) returns (PostResponse);
  rpc GetPost    (GetPostRequest)    returns (PostResponse);
  rpc GetPosts   (GetPostsRequest)   returns (PostsResponse);
  rpc UpdatePost (UpdatePostRequest) returns (PostResponse);
  rpc DeletePost (DeletePostRequest) returns (DeletePostResponse);
}
```

Auth flow: `AuthJwtAccessGuard` calls `GrpcAuthService.validateToken` (in `src/services/auth/grpc.auth.service.ts`) → auth-service gRPC → returns `{ id, role }` attached to `request.user`.

## Project Structure

```
src/
├── app/
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Health check
│   └── post.grpc.controller.ts    # gRPC PostService endpoints
├── common/
│   ├── config/                    # Typed registerAs() config factories
│   ├── decorators/                # @PublicRoute, @AdminOnly, @AuthUser, @MessageKey
│   ├── guards/                    # AuthJwtAccessGuard (gRPC-based), RolesGuard
│   ├── services/                  # QueryBuilderService
│   └── interceptors/              # ResponseInterceptor
├── modules/
│   └── post/                      # Post CRUD module
│       ├── controllers/
│       ├── services/
│       │   ├── post.service.ts
│       │   └── post-mapping.service.ts  # Enriches posts with author data
│       └── dtos/
├── services/
│   └── auth/
│       └── grpc.auth.service.ts   # gRPC client → auth-service ValidateToken
├── protos/                        # post.proto, auth.proto
└── generated/                     # Auto-generated gRPC types
```

## Scripts

```bash
npm run dev              # Watch mode (proto:generate first)
npm run build            # Production build
npm run proto:generate   # Regenerate gRPC types from .proto
npm run lint             # ESLint --fix
npm run format           # Prettier --write
npm test                 # Unit tests (100% coverage enforced)
npm run test:cov         # Tests with coverage report
```

## Testing

Tests live in `test/unit/`. Coverage thresholds are enforced at **100%** for branches, functions, lines, and statements.

```bash
npm test
```

## Response Shape

All HTTP responses are wrapped by `ResponseInterceptor`:

```json
{
  "statusCode": 200,
  "timestamp": "2026-01-01T00:00:00.000Z",
  "message": "post.success.create",
  "data": { ... }
}
```

## License

[MIT](LICENSE)
