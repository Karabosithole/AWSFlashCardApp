# AWS Flashcard App

A comprehensive TypeScript flashcard application built with Angular frontend and Node.js backend. This app allows users to create, manage, and study flashcards with AI-powered features and learning progress tracking.

## Features

- 🔐 **Secure Authentication**: JWT-based login/logout system
- 📚 **Flashcard Management**: Create, edit, and organize flashcard stacks
- 🧠 **Smart Study Sessions**: Spaced repetition algorithm for optimal learning
- 📊 **Progress Tracking**: Detailed statistics and learning analytics
- 🤖 **AI Integration**: Generate flashcards and improve content with AI
- 🎨 **Modern UI**: Beautiful Material Design interface
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **Angular 18** with standalone components
- **Angular Material** for UI components
- **TypeScript** for type safety
- **RxJS** for reactive programming
- **SCSS** for styling

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (v5 or higher)
- **Git**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AWSFlashCardApp
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp backend/env.example backend/.env
   ```
   
   Edit `backend/.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/flashcard-app
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # CORS
   FRONTEND_URL=http://localhost:4200
   
   # AI API (Optional - for AI features)
   AI_API_KEY=your-ai-api-key-here
   AI_API_URL=https://api.openai.com/v1
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

## Running the Application

### Development Mode

Start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend development server on `http://localhost:4200`

### Individual Services

**Backend only:**
```bash
npm run server:dev
```

**Frontend only:**
```bash
npm run client:dev
```

### Production Build

Build both frontend and backend for production:
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Flashcard Stacks
- `GET /api/stacks` - Get user's stacks
- `POST /api/stacks` - Create new stack
- `GET /api/stacks/:id` - Get specific stack
- `PUT /api/stacks/:id` - Update stack
- `DELETE /api/stacks/:id` - Delete stack
- `POST /api/stacks/:id/duplicate` - Duplicate stack

### Flashcards
- `GET /api/cards/stack/:stackId` - Get cards for stack
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get specific card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/study` - Record study session

### AI Features
- `POST /api/ai/generate-flashcards` - Generate flashcards with AI
- `POST /api/ai/improve-flashcard/:id` - Improve existing flashcard
- `POST /api/ai/explain-concept` - Get concept explanation
- `POST /api/ai/generate-study-plan` - Generate study plan

### User Statistics
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/study-history` - Get study history

## Project Structure

```
AWSFlashCardApp/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Angular components
│   │   │   ├── services/    # Angular services
│   │   │   ├── guards/      # Route guards
│   │   │   └── interceptors/# HTTP interceptors
│   │   └── styles.scss      # Global styles
│   ├── package.json
│   └── angular.json
└── package.json             # Root package.json
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Express validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet.js for security headers
- **Environment Variables**: Sensitive data in environment variables

## Learning Features

- **Spaced Repetition**: SuperMemo algorithm for optimal review timing
- **Progress Tracking**: Detailed statistics on learning progress
- **Study Streaks**: Gamification with daily study streaks
- **Difficulty Levels**: Easy, medium, hard card classifications
- **Study Analytics**: Comprehensive learning analytics

## AI Integration

The app supports AI-powered features when an AI API key is configured:

- **Flashcard Generation**: Create flashcards from topics
- **Content Improvement**: Enhance existing flashcards
- **Concept Explanation**: Get detailed explanations
- **Study Planning**: AI-generated study schedules

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact the development team

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Collaborative study groups
- [ ] Advanced AI features
- [ ] Offline support
- [ ] Export/Import functionality
- [ ] Advanced analytics dashboard