# 🏁 Chess Application

![GitHub last commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/chess-application)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/chess-application)
![GitHub pull requests](https://img.shields.io/github/pulls/YOUR_USERNAME/chess-application)
![License](https://img.shields.io/github/license/YOUR_USERNAME/chess-application)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)

> **A complete web-based chess application built from scratch** featuring multiplayer functionality, AI opponent, and user authentication.

## 🎯 Project Overview

This chess application was developed independently as a comprehensive full-stack portfolio project. It demonstrates proficiency in modern web development technologies and best practices.

### 🏆 Key Features

- **♟️ Full Chess Implementation** - Complete chess rules with move validation
- **👥 Real-time Multiplayer** - Play with friends online via WebSockets
- **🤖 AI Opponent** - 4 difficulty levels using minimax algorithm
- **🔐 User Authentication** - Secure JWT-based login/registration
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🐳 Docker Deployment** - Production-ready containerization

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design with animations
- **JavaScript (ES6+)** - Modern JavaScript features
- **Socket.io Client** - Real-time communication
- **Chess.js** - Chess game engine

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD pipeline
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/chess-application.git
   cd chess-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Docker Deployment

```bash
# Quick deployment with Docker Compose
./deploy.sh

# Or manually
docker-compose up -d --build
```

## 📁 Project Structure

```
chess-application/
├── 📄 README.md                    # Project documentation
├── 📄 DEVELOPMENT-JOURNAL.md       # 30-day development log
├── 📄 package.json                 # Dependencies and scripts
├── 🚀 server.js                    # Backend server
├── 🗄️ database.js                  # MongoDB schemas
├── 🔐 auth.js                      # Authentication controller
├── 🤖 ai-opponent.js               # AI chess engine
├── 🎨 index.html                   # Frontend application
├── 🎨 styles.css                   # Styling
├── ⚡ script.js                    # Game logic
├── 🐳 docker-compose.yml           # Container orchestration
├── 🐳 Dockerfile                   # Container configuration
├── 🌐 nginx.conf                   # Reverse proxy setup
└── 🚀 deploy.sh                    # Deployment script
```

## 🎮 How to Play

### Game Modes
1. **Local Play** - Play against a friend on the same device
2. **AI Opponent** - Challenge the computer (Easy, Medium, Hard, Expert)
3. **Online Multiplayer** - Play with friends remotely

### Controls
- **Drag & Drop** - Move pieces by dragging
- **Click to Move** - Click piece, then click destination
- **Keyboard Shortcuts**:
  - `Ctrl+Z` - Undo move
  - `F` - Flip board
  - `N` - New game

## 🏗️ Development Journey

This project was developed over 30 days with a structured approach:

### Phase 1: Frontend Foundation (Days 1-7)
- Built responsive chessboard
- Implemented drag-and-drop functionality
- Integrated chess.js for game validation

### Phase 2: Backend Architecture (Days 8-12)
- Created Express server with REST API
- Designed MongoDB schemas
- Implemented authentication system

### Phase 3: Real-time Features (Days 13-16)
- Integrated Socket.io for multiplayer
- Built game synchronization
- Added matchmaking system

### Phase 4: AI Implementation (Days 17-20)
- Developed minimax algorithm
- Implemented alpha-beta pruning
- Created difficulty levels

### Phase 5: Deployment & DevOps (Days 21-30)
- Containerized with Docker
- Set up CI/CD pipeline
- Created deployment automation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run security audit
npm audit
```

## 📊 Project Statistics

- **Development Time**: 30 days
- **Lines of Code**: ~4,500
- **Files Created**: 20+
- **Technologies Used**: 12
- **Features Implemented**: 25+

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chess-app
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Docker Deployment**
   ```bash
   ./deploy.sh
   ```

3. **Manual Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

- **Heroku** - Easy deployment with Docker
- **AWS** - EC2 + RDS + ElastiCache
- **Google Cloud** - Cloud Run + Firestore
- **Azure** - Container Instances + Cosmos DB

## 🤝 Contributing

This project was developed as a learning experience. Feel free to:

- 📖 **Study the code** - Learn from the implementation
- 🐛 **Report issues** - Help improve the project
- 💡 **Suggest improvements** - Share your ideas
- 🔀 **Fork and build** - Create your own version

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Chess.js** - Chess game engine
- **Socket.io** - Real-time communication
- **Express.js** - Web framework
- **MongoDB** - Database
- **Docker** - Containerization

## 📧 Contact

- **GitHub**: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- **Email**: your.email@example.com
- **Portfolio**: https://your-portfolio.com

---

⭐ **If you find this project impressive, please give it a star!** ⭐

Built with ❤️ by [Your Name](https://github.com/YOUR_USERNAME)
