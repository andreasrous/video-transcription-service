# Video Transcription Service

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Docker-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-red)

A backend service for uploading .mp4 videos and generating text transcripts using the OpenAI Whisper API. The system supports asynchronous processing, transcript management, secure file handling, and a clean RESTful API for integration with any frontend.

## Features

- 🎥 Video upload with validation (MP4, ≤100MB)
- 🔐 JWT authentication
- 🤖 Async Whisper transcription processing
- 📝 Transcript management
- 🔍 Video metadata tracking

## Prerequisites

- **Node.js 20+**
- **Docker**
- **OpenAI API key**

## Installation

### 1. Clone the repository

```
git clone https://github.com/your-username/video-transcription-app.git
cd video-transcription-app
```

### 2. Install dependencies

```
npm install
```

### 3. Start PostgreSQL in Docker

```
docker run --name transcription-db --rm \
-e POSTGRES_PASSWORD=pass123 \
-e POSTGRES_USER=dbuser \
-e POSTGRES_DB=appdb \
-d \
-p 5432:5432 \
-v transcription-vol:/var/lib/postgresql/data \
postgres:14
```

### 4. Setup your environment

Create a .env file:

```
# Database
DATABASE_URL

# Server
PORT
NODE_ENV
MAX_FILE_SIZE_BYTES

# Authentication
JWT_SECRET

# OpenAI
OPENAI_API_KEY
OPENAI_WHISPER_MODEL
```

### 5. Set up the database

```
npx prisma migrate dev --name init
npx prisma generate
```

## Running the App

### Development Mode (with hot-reload)

```
npm run dev
```

### Production Build

```
npm run build
npm start
```

## Key Architecture Decisions

1. **Child Processes** instead of Redis/BullMQ for background transcription
2. **Dockerized PostgreSQL** for easy database management
3. **ES Modules** with TypeScript
4. **Prisma ORM** for database operations

## API Endpoints

| Method | Endpoint                             | Description                            |
| ------ | ------------------------------------ | -------------------------------------- |
| POST   | /auth/register                       | Register a new user                    |
| POST   | /auth/login                          | Authenticate and receive JWT           |
| POST   | /videos/upload                       | Upload a video file (.mp4)             |
| GET    | /videos                              | Get all videos for current user        |
| GET    | /videos/:videoId                     | Get video metadata + transcript        |
| GET    | /videos/:videoId/transcript/download | Download transcript as .txt            |
| DELETE | /videos/:videoId                     | Delete video and associated transcript |
