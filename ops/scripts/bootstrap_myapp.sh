#!/bin/bash

# DesignConnect Pro Bootstrap Script
# This script sets up the entire application environment

set -e

echo "🚀 Starting DesignConnect Pro Bootstrap..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p logs
mkdir -p ops/grafana/provisioning/datasources
mkdir -p ops/grafana/provisioning/dashboards
mkdir -p ops/grafana/dashboards

# Setup environment files
echo "⚙️ Setting up environment files..."

if [ ! -f server/.env ]; then
    cat > server/.env << EOF
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://admin:adminpassword@localhost:27017/designconnect?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
EOF
    echo "✅ Created server/.env"
fi

# Install dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
npm run build
cd ..

# Start Docker containers
echo "🐳 Starting Docker containers..."
cd ops
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

echo "✅ Bootstrap complete!"
echo ""
echo "📊 Access your services at:"
echo "  Frontend:   http://localhost"
echo "  Backend:    http://localhost:3001"
echo "  Prometheus: http://localhost:9090"
echo "  Grafana:    http://localhost:3000 (admin/admin)"
echo ""
echo "🔧 To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "  docker-compose down"
