# DesignConnect Pro - Full Stack Platform

แพลตฟอร์มครบวงจรสำหรับธุรกิจ รวมระบบร้านค้าออนไลน์, POS, สตรีมมิ่ง, และแชทแบบเรียลไทม์

## ฟีเจอร์หลัก

- Authentication & Authorization (Email/Password, OAuth)
- Chat & Realtime (Socket.IO)
- TV/Streaming (HLS.js)
- Admin Panel
- POS System
- E-commerce
- Monitoring & Analytics

## โครงสร้างโปรเจกต์

```
designconnect-pro/
├── frontend/          # HTML/CSS/JS Frontend
├── server/           # NestJS Backend
├── ops/              # DevOps configs
└── docker-compose.yml
```

## การติดตั้ง

### ใช้ Docker (แนะนำ)

```bash
docker-compose up -d
```

### Manual Setup

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
# Open index.html in browser or use live server
```

## Environment Variables

สร้างไฟล์ `.env` ใน `server/`:

```
MONGODB_URI=mongodb://localhost:27017/designconnect
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## API Endpoints


### Authentication
```bash
# Register new user
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0812345678",
  "password": "securePassword123"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}

# Get current user
GET /api/auth/me
Authorization: Bearer {token}
```

### Chat (WebSocket)
```javascript
// Connect to chat
const socket = io('http://localhost:3001')

// Join room
socket.emit('join_room', { room: 'general', userId: '...' })

// Send message
socket.emit('message', { room: 'general', text: 'Hello!' })

// Listen for messages
socket.on('message', (data) => {
  console.log(data)
})
```

### Health Check
```bash
GET /health
GET /health/live
GET /health/ready
```

## ระบบความปลอดภัย

- JWT Authentication
- Password hashing with bcrypt
- HTTPS/TLS support
- CORS configuration
- Rate limiting

## การพัฒนาต่อ

1. เพิ่ม OAuth providers (Google, LINE, Facebook)
2. ระบบ Monitoring (Prometheus, Grafana)
3. Synthetic checks & alerts
4. Admin dashboard
5. Payment integration

## Code Examples

### HTML Structure
```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>DesignConnect Pro</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <nav class="top-nav">...</nav>
    <aside class="sidebar">...</aside>
    <main class="content">...</main>
    <script src="scripts/main.js"></script>
</body>
</html>
```

### CSS Styling
```css
/* Custom animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive sidebar */
.sidebar-expanded { width: 280px; }
.sidebar-collapsed { width: 70px; }
```

### JavaScript Authentication
```javascript
class AuthManager {
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    localStorage.setItem('authToken', data.token)
    return data
  }
}
```

### TypeScript Backend (NestJS)
```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials)
  }
}
```

### Python Analytics Script
```python
import pandas as pd
import matplotlib.pyplot as plt

# Analyze sales data
df = pd.read_csv('sales.csv')
top_products = df.groupby('product')['quantity'].sum().sort_values(ascending=False).head(10)

plt.figure(figsize=(12, 6))
top_products.plot(kind='bar')
plt.title('Top 10 Best Selling Products')
plt.xlabel('Product')
plt.ylabel('Quantity Sold')
plt.tight_layout()
plt.savefig('sales_report.png')
```

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**MongoDB connection failed**
```bash
# Start MongoDB service
sudo systemctl start mongodb
# or
docker run -d -p 27017:27017 mongo:latest
```

**CORS errors**
- Check `main.ts` CORS configuration
- Add your frontend URL to allowed origins

**WebSocket connection failed**
- Ensure backend is running on port 3001
- Check firewall settings
- Verify Socket.IO client version matches server

## Performance Optimization

### Frontend
- Minify CSS/JS files
- Enable browser caching
- Use CDN for static assets
- Lazy load images

### Backend
- Enable response compression
- Implement Redis caching
- Use database indexes
- Connection pooling

## Testing

### Unit Tests
```bash
cd server
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3001/health
```

## License

MIT
