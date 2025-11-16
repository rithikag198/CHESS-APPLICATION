#!/bin/bash

# Chess Application Deployment Script
# This script automates the deployment process for the chess application

set -e

echo "🏁 Starting Chess Application Deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ssl logs

# Generate SSL certificates for local development (if they don't exist)
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo "🔐 Generating SSL certificates for local development..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=US/ST=State/L=City/O=ChessApp/OU=Development/CN=localhost"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration before running in production."
fi

# Build and start the services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
else
    echo "❌ Some services failed to start. Check the logs:"
    docker-compose logs
    exit 1
fi

# Run database migrations if needed
echo "🗄️ Running database migrations..."
docker-compose exec backend npm run migrate || echo "No migrations needed or migration failed"

# Display service URLs
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Access backend shell: docker-compose exec backend sh"
echo "   Access database: docker-compose exec mongodb mongo"
echo ""

# Optional: Run tests
if [ "$1" = "--with-tests" ]; then
    echo "🧪 Running tests..."
    docker-compose exec backend npm test
    echo "✅ Tests completed!"
fi

echo "🏁 Deployment finished!"
