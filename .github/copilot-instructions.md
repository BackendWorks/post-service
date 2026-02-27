# Copilot Instructions – Post Service

## Overview

Manages blog posts with full CRUD over REST (`:9002`) and gRPC (`:50052`). Does **not** own user data — author information is stored as a UUID (`createdBy`) and enriched at response-mapping time via `PostMappingService`. Authentication is delegated entirely to the Auth service via gRPC on every request.

## Developer Workflows

Run all commands from the `post/` directory:

```bash
npm run dev              # proto:generate → nest start --watch
npm run test             # jest --runInBand, 100% coverage enforced
npm run proto:generate   # regenerates src/generated/auth.ts + post.ts from src/protos/
```

**Database migrations are NOT run from here.** The post service consumes `@backendworks/post-db`.
Run all Prisma commands from `packages/post-db/` instead:

```bash
# from packages/post-db/
npm run prisma:migrate   # dotenv -e .env -- prisma migrate dev
npm run prisma:studio    # dotenv -e .env -- prisma studio
```

## REST Endpoints

All endpoints require a `Bearer` token (validated via gRPC to Auth service).

| Method | Path        | Notes                                      | Controller           |
| ------ | ----------- | ------------------------------------------ | -------------------- |
| POST   | `/post`     | `user.id` from `@AuthUser()`               | `post.controller.ts` |
| GET    | `/post`     | Paginated, searchable (`title`, `content`) | `post.controller.ts` |
| GET    | `/post/:id` | UUID param via `ParseUUIDPipe`             | `post.controller.ts` |
| PUT    | `/post/:id` | Only author can update                     | `post.controller.ts` |
| DELETE | `/post/:id` | Soft delete (`deletedAt`, `isDeleted`)     | `post.controller.ts` |

## gRPC Server

Two proto files. Types auto-generated into `src/generated/` — never edit manually.

- `src/protos/post.proto` → `src/generated/post.ts` — PostService RPCs served by `post.grpc.controller.ts`
- `src/protos/auth.proto` → `src/generated/auth.ts` — Auth client types used by `GrpcAuthService`

```bash
npm run proto:generate   # must re-run after editing either .proto file
```

## Authentication Guard — Critical Difference from Auth Service

`post/src/common/guards/jwt.access.guard.ts` does **not** use Passport. It calls `GrpcAuthService.validateToken()` over gRPC to the Auth service, then sets `request.user = { id, role }`.

```
HTTP Request → AuthJwtAccessGuard → GrpcAuthService.validateToken(token)
                                          ↓ gRPC call to auth-service:50051
                                    ValidateTokenResponse { success, payload }
                                          ↓
                                    request.user = { id, role }
```

`GrpcAuthService` lives in `src/services/auth/grpc.auth.service.ts` — it is registered in `CommonModule` so every module in the service can inject it.

## Key Patterns

### Creating a new endpoint

1. Add DTO in `modules/post/dtos/`
2. Add i18n key in `languages/en/post.json`
3. Decorate controller method with `@MessageKey('post.success.action')`
4. Implement in `PostService` and declare in `IPostService` interface
5. Add 100% test coverage in `test/unit/post.service.spec.ts`

### Author data enrichment

`PostMappingService.mapToResponse()` builds a `PostResponseDto` with a `createdBy` object shaped like a user. Currently the user fields (`email`, `firstName`, etc.) are placeholders — if you need real author data, call `GrpcAuthService.getUserById()` inside `PostMappingService`.

### Soft delete

`PostService.remove()` sets `deletedAt: new Date()` and `isDeleted: true`. `QueryBuilderService` always adds `deletedAt: null` to `WHERE` so soft-deleted posts never appear in list queries.

### Bulk operations

`PostService.softDeletePosts(userId, postIds[])` and `PostBulkRequestDto` / `PostBulkResponseDto` exist for batch soft-delete — expose via `DELETE /post/bulk` if needed.

### Config namespaces

No `auth.*` namespace here (no JWT secrets). Available namespaces:

| File              | Namespace | Key example                |
| ----------------- | --------- | -------------------------- |
| `app.config.ts`   | `app.*`   | `app.http.port`            |
| `grpc.config.ts`  | `grpc.*`  | `grpc.url`, `grpc.package` |
| `redis.config.ts` | `redis.*` | `redis.url`, `redis.ttl`   |
| `doc.config.ts`   | `doc.*`   | `doc.enable`               |

## Folder Structure

```
src/
  app/
    app.module.ts               # Wires CommonModule, PostModule, GrpcModule (post.proto, :50052)
    app.controller.ts           # GET /health
    post.grpc.controller.ts     # gRPC: CreatePost, GetPost, GetPosts, UpdatePost, DeletePost
  common/
    common.module.ts            # Global: config, Joi validation, cache, guards, i18n, interceptors
                                #   also registers GrpcAuthService as provider
    config/                     # registerAs() factories (app, grpc, redis, doc — NO auth config)
    guards/
      jwt.access.guard.ts       # gRPC-based guard — calls GrpcAuthService (NOT Passport)
      roles.guard.ts            # Role metadata guard (same pattern as auth service)
    services/
      hash.service.ts           # bcrypt helpers (same pattern as auth, not shared code)
      query-builder.service.ts  # findManyWithPagination() — delegates to IPostRepository
    decorators/                 # @PublicRoute, @AdminOnly, @UserAndAdmin, @AuthUser, @MessageKey
    dtos/                       # ApiBaseQueryDto, SwaggerResponse(), SwaggerPaginatedResponse()
    filters/                    # ResponseExceptionFilter (Sentry on 5xx)
    interceptors/               # ResponseInterceptor — wraps all responses in envelope
    middlewares/                # RequestMiddleware — adds X-Request-ID, structured HTTP logs
    enums/
      app.enum.ts               # APP_ENVIRONMENT, ROLE (ADMIN | USER)
    interfaces/                 # IAuthUserPayload, IApiResponse, QueryBuilderOptions
    constants/                  # REQUEST / RESPONSE metadata key strings
  languages/en/
    post.json                   # post.success.created / listed / found / updated / deleted
    auth.json                   # generic auth error keys
    http.json                   # generic HTTP status message keys
  modules/
    post/
      controllers/
        post.controller.ts          # Full REST CRUD; uses @AuthUser() for user context
      services/
        post.service.ts             # create/createPost, findAll, findOne, update, remove,
                                    #   softDeletePosts, getPosts, updatePost
        post-mapping.service.ts     # Maps Prisma Post → PostResponseDto; enriches author data
      dtos/
        post-create.dto.ts          # title, content, images?
        post-update.dto.ts          # Partial update fields
        post-list.dto.ts            # Extends ApiBaseQueryDto
        post.response.dto.ts        # Full post shape with nested createdBy user object
        post-user.response.dto.ts   # Nested user shape within post response
        post-bulk-request.dto.ts    # postIds: string[]
        post-bulk-response.dto.ts   # Bulk operation result
      interfaces/
        post-service.interface.ts   # IPostService — all service methods declared here
  services/
    auth/
      grpc.auth.service.ts      # gRPC CLIENT — validateToken(), getUserById(), getUserByEmail()
  protos/
    auth.proto                  # Client-side copy of auth contract (for type generation)
    post.proto                  # Source of truth for PostService gRPC contract
  generated/
    auth.ts                     # AUTO-GENERATED from auth.proto — do not edit
    post.ts                     # AUTO-GENERATED from post.proto — do not edit
# No prisma/ directory here — schema and migrations live in packages/post-db/
test/
  jest.json                     # rootDir: ../, coverage 100% on *.service.ts
  unit/
    grpc.auth.service.spec.ts
    hash.service.spec.ts
    post-mapping.service.spec.ts
    post.service.spec.ts
    query-builder.service.spec.ts
```

## Testing Conventions

```typescript
// Manual mock pattern — GrpcClientService mock example
const mockGrpcClientService = { call: jest.fn() };
const module = await Test.createTestingModule({
    providers: [GrpcAuthService, { provide: GrpcClientService, useValue: mockGrpcClientService }],
}).compile();
```

- No `@nestjs/testing` auto-mocking; every dependency is a plain `jest.fn()` object
- Controllers excluded from coverage; only `*.service.ts` files measured
- Tests run serially with `--runInBand`; do not use `beforeAll` for shared mutable state
