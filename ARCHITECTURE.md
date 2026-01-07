# System Architecture Documentation

## Overview

DesignConnect Pro is a modern full-stack web application built with a separation of concerns architecture, utilizing vanilla JavaScript for the frontend and NestJS for the backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Browser (HTML/CSS/JavaScript)                        │  │
│  │  - index.html (Structure)                             │  │
│  │  - main.css (Styling)                                 │  │
│  │  - auth.js, navigation.js, carousel.js, socket.js    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  NestJS Application (main.ts)                         │  │
│  │  - CORS handling                                      │  │
│  │  - Global pipes & guards                             │  │
│  │  - Exception filters                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┬──────────────┬──────────────┬─────────┐  │
│  │ Auth Module  │ Users Module │ Chat Module  │ Health  │  │
│  │ - Controller │ - Service    │ - Gateway    │ Module  │  │
│  │ - Service    │ - Schema     │ - Service    │         │  │
│  │ - Strategy   │              │              │         │  │
│  └──────────────┴──────────────┴──────────────┴─────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────┬────────────────────────────────┐ │
│  │   MongoDB            │   Redis                        │ │
│  │   - Users            │   - Sessions                   │ │
│  │   - Messages         │   - Cache                      │ │
│  │   - Audit Logs       │   - Socket.IO adapter          │ │
│  └──────────────────────┴────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Architecture

#### 1. Structure Layer (index.html)
- Semantic HTML5 markup
- Modular page sections
- Modal systems
- Accessibility features

#### 2. Presentation Layer (main.css)
- Tailwind CSS utilities
- Custom animations
- Responsive breakpoints
- Theme variables

#### 3. Logic Layer (JavaScript Modules)

**auth.js - Authentication Manager**
```javascript
class AuthManager {
  constructor() {
    this.currentUser = null
    this.token = localStorage.getItem('authToken')
  }
  
  async handleLogin() { /* ... */ }
  async handleRegister() { /* ... */ }
  async checkAuthStatus() { /* ... */ }
  updateUI() { /* ... */ }
  logout() { /* ... */ }
}
```

**navigation.js - SPA Router**
```javascript
class NavigationManager {
  navigate(page) { /* ... */ }
  toggleSidebar() { /* ... */ }
  setActivePage(page) { /* ... */ }
}
```

**carousel.js - Banner System**
```javascript
class CarouselManager {
  constructor() {
    this.currentSlide = 0
    this.autoPlayInterval = null
  }
  
  nextSlide() { /* ... */ }
  prevSlide() { /* ... */ }
  startAutoPlay() { /* ... */ }
}
```

**socket.js - Realtime Communication**
```javascript
class SocketManager {
  constructor() {
    this.socket = io('http://localhost:3001')
  }
  
  joinRoom(room) { /* ... */ }
  sendMessage(data) { /* ... */ }
  onMessage(callback) { /* ... */ }
}
```

### Backend Architecture

#### 1. Entry Point (main.ts)
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
  
  app.useGlobalPipes(new ValidationPipe())
  
  await app.listen(3001)
}
```

#### 2. Module System

**AppModule (Root)**
```typescript
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ChatModule,
    HealthModule
  ]
})
export class AppModule {}
```

**AuthModule**
```typescript
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
```

**UsersModule**
```typescript
@Module({
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
```

**ChatModule**
```typescript
@Module({
  providers: [ChatGateway]
})
export class ChatModule {}
```

#### 3. Data Flow

```
Request → Controller → Service → Database
                ↓
Response ← DTO ← Entity ← Query Result
```

**Example Flow:**
```typescript
// 1. Client Request
POST /api/auth/login
Body: { email, password }

// 2. Controller receives
@Post('login')
login(@Body() dto: LoginDto)

// 3. Service processes
authService.login(dto)
  → usersService.findByEmail(email)
  → bcrypt.compare(password, hash)
  → jwtService.sign(payload)

// 4. Response sent
{ token: '...', user: { ... } }
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
   ↓
2. AuthService validates against database
   ↓
3. Generate JWT token (7 day expiry)
   ↓
4. Return token + sanitized user data
   ↓
5. Client stores token in localStorage
   ↓
6. Include token in Authorization header
   ↓
7. JwtStrategy validates token
   ↓
8. Request proceeds with user context
```

### Authorization Layers

**Level 1: Authentication (JwtAuthGuard)**
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user
}
```

**Level 2: Role-based (RolesGuard)**
```typescript
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('users')
getAllUsers() { ... }
```

**Level 3: Resource ownership**
```typescript
@UseGuards(JwtAuthGuard, OwnershipGuard)
@Patch('posts/:id')
updatePost(@Param('id') id, @Request() req) { ... }
```

## Data Models

### User Schema (MongoDB)
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,          // unique index
  phone?: string,
  password: string,       // bcrypt hashed
  role: 'USER' | 'PREMIUM' | 'ADMIN',
  avatar?: string,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt?: Date
}
```

### Message Schema
```typescript
{
  _id: ObjectId,
  room: string,
  user: ObjectId,         // ref: User
  text: string,
  timestamp: Date,
  edited: boolean,
  deleted: boolean,
  reactions: [{
    emoji: string,
    userId: ObjectId
  }]
}
```

### Audit Log Schema
```typescript
{
  _id: ObjectId,
  action: string,
  userId: ObjectId,
  targetId?: ObjectId,
  metadata: object,
  ipAddress: string,
  userAgent: string,
  timestamp: Date
}
```

## Communication Patterns

### HTTP REST API

**Standard Endpoints:**
```
GET    /resource       → List all
GET    /resource/:id   → Get one
POST   /resource       → Create
PATCH  /resource/:id   → Update
DELETE /resource/:id   → Delete
```

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Format:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2025-01-06T..."
}
```

### WebSocket Events

**Client → Server:**
```javascript
socket.emit('join_room', { room, userId })
socket.emit('leave_room', { room })
socket.emit('message', { room, text })
socket.emit('typing', { room, userId })
```

**Server → Client:**
```javascript
socket.on('message', (data) => {
  // { id, room, user, text, timestamp }
})
socket.on('user_joined', (data) => {
  // { userId, userName, room }
})
socket.on('user_left', (data) => {
  // { userId, room }
})
socket.on('error', (error) => {
  // { message, code }
})
```

## Scalability Considerations

### Horizontal Scaling

**Stateless API Design:**
- No server-side sessions
- JWT for authentication
- Shared Redis for cache

**Load Balancing:**
```
          ┌────────────┐
          │   Nginx    │
          └────┬───┬───┘
               │   │
        ┌──────┘   └──────┐
        ▼                 ▼
    ┌────────┐      ┌────────┐
    │ API #1 │      │ API #2 │
    └───┬────┘      └───┬────┘
        │               │
        └───────┬───────┘
                ▼
          ┌────────┐
          │ Redis  │
          │ MongoDB│
          └────────┘
```

**Socket.IO Clustering:**
```typescript
const redisAdapter = require('@socket.io/redis-adapter')
const { createAdapter } = redisAdapter
const { createClient } = require('redis')

const pubClient = createClient({ url: REDIS_URL })
const subClient = pubClient.duplicate()

io.adapter(createAdapter(pubClient, subClient))
```

### Vertical Scaling

**Database Optimization:**
```javascript
// Compound indexes
db.users.createIndex({ email: 1, role: 1 })
db.messages.createIndex({ room: 1, timestamp: -1 })

// Connection pooling
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10
})
```

**Caching Strategy:**
```typescript
// Redis caching
async getUser(id: string) {
  const cached = await redis.get(`user:${id}`)
  if (cached) return JSON.parse(cached)
  
  const user = await db.users.findById(id)
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user))
  return user
}
```

### Performance Optimization

**Frontend:**
- Code splitting
- Lazy loading
- Image optimization
- Service workers
- Browser caching

**Backend:**
- Query optimization
- Response compression
- Rate limiting
- Database indexes
- CDN integration

## Monitoring Strategy

### Application Metrics

```typescript
// Prometheus exporter
import { PrometheusModule } from '@willsoto/nestjs-prometheus'

@Module({
  imports: [
    PrometheusModule.register()
  ]
})
export class MetricsModule {}
```

**Key Metrics:**
- Request rate (req/s)
- Response time (ms)
- Error rate (%)
- Active connections
- Database queries/s

### Health Checks

```typescript
@Get('health/live')
checkLiveness() {
  return { status: 'ok' }
}

@Get('health/ready')
async checkReadiness() {
  const db = await this.checkDatabase()
  const redis = await this.checkRedis()
  
  return {
    status: db && redis ? 'ok' : 'error',
    checks: { database: db, redis }
  }
}
```

### Logging

```typescript
import { Logger } from '@nestjs/common'

export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  
  async login(credentials: LoginDto) {
    this.logger.log(`Login attempt: ${credentials.email}`)
    // ...
  }
}
```

## Deployment Architecture

### Development
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### Staging (Docker Compose)
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
  
  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=staging
```

### Production (Kubernetes)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    spec:
      containers:
      - name: api
        image: designconnect/api:latest
        ports:
        - containerPort: 3001
```

## Testing Strategy

### Unit Tests
```typescript
describe('AuthService', () => {
  it('should hash password on register', async () => {
    const result = await authService.register({
      email: 'test@test.com',
      password: 'password123'
    })
    expect(result.password).not.toBe('password123')
  })
})
```

### Integration Tests
```typescript
describe('AuthController (e2e)', () => {
  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'pass' })
      .expect(201)
  })
})
```

### Load Tests
```bash
# k6 load test
import http from 'k6/http'

export default function() {
  http.get('http://localhost:3001/health')
}
```

## Future Enhancements

### Phase 1 (Completed)
- ✅ Basic CRUD operations
- ✅ JWT Authentication
- ✅ Realtime chat
- ✅ Admin panel structure

### Phase 2 (In Progress)
- 🔄 Payment integration (Stripe)
- 🔄 Advanced analytics
- 🔄 Email notifications
- 🔄 Mobile responsive design

### Phase 3 (Planned)
- 📋 Mobile apps (React Native)
- 📋 AI features (recommendations)
- 📋 Microservices architecture
- 📋 GraphQL API
- 📋 Advanced monitoring (Grafana)
