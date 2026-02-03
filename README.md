# MedTranslate

Real-time AI-powered healthcare translation web application enabling seamless doctor-patient communication across language barriers.

Built for the Nao Medical Software Engineering Intern Assessment.

## Features

- **Real-time Translation**: Bidirectional English ↔ Spanish translation via OpenRouter AI
- **WebSocket Messaging**: Live chat between Doctor and Patient roles
- **Audio Recording**: Browser-based audio recording with playback
- **Live Speech-to-Text**: Web Speech API integration for voice input
- **Conversation Persistence**: SQLite database for message history
- **AI Medical Summaries**: Automatic generation of structured medical summaries
- **Conversation Search**: Search across all messages with highlighting

## Tech Stack

### Backend
- **Python 3.11+** with FastAPI
- **SQLite** + SQLAlchemy for data persistence
- **OpenRouter API** (Claude 3 Haiku/Sonnet) for AI services
- **WebSocket** for real-time messaging

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** with Nao Medical brand colors
- **React Query** for server state management
- **Lucide React** for icons

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Add your OpenRouter API key to .env
# OPENROUTER_API_KEY=sk-or-v1-xxx

# Run the server
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# The defaults are fine for local development
# VITE_API_URL=http://localhost:8000
# VITE_WS_URL=ws://localhost:8000

# Run dev server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/translate` | Translate text |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations` | List all conversations |
| GET | `/api/conversations/{id}` | Get conversation + messages |
| POST | `/api/conversations/{id}/summarize` | Generate medical summary |
| POST | `/api/messages` | Create message |
| POST | `/api/audio/upload` | Upload audio file |
| GET | `/api/audio/{id}` | Stream audio file |
| GET | `/api/search?q={query}` | Search messages |

### WebSocket

Connect to: `ws://localhost:8000/ws/{conversation_id}`

Events:
- `join_conversation` - Join a conversation
- `send_message` - Send a message
- `typing` - Typing indicator
- `new_message` - New message broadcast

## Environment Variables

### Backend (.env)
```env
OPENROUTER_API_KEY=sk-or-v1-xxx
DATABASE_URL=sqlite:///./data/medtranslate.db
ALLOWED_ORIGINS=http://localhost:5173,https://medtranslate.vercel.app
AUDIO_STORAGE_PATH=./data/audio
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Project Structure

```
nao_medical/
├── backend/                # FastAPI backend
│   ├── main.py            # Application entry point
│   ├── config.py          # Settings management
│   ├── database.py        # SQLAlchemy setup
│   ├── models/            # ORM models
│   ├── schemas/           # Pydantic schemas
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   ├── prompts/           # AI prompts
│   └── websocket/         # WebSocket handlers
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # React Context
│   │   ├── services/      # API & WebSocket clients
│   │   ├── types/         # TypeScript types
│   │   └── pages/         # Page components
│   └── package.json
│
├── docs/                  # Documentation
├── files/                 # PRD, phases, tech decisions
└── README.md
```

## Demo Script

1. **Start the application**: Run both backend and frontend
2. **Create a conversation**: Click "Start New Conversation"
3. **Send a message as Doctor**:
   - Select "Doctor" role
   - Type: "Hello, I'm Dr. Smith. How can I help you today?"
   - Click Send
4. **See translation**: Message appears with Spanish translation
5. **Reply as Patient**:
   - Select "Patient" role
   - Type: "Hola, tengo dolor de cabeza"
   - Click Send
6. **See translation**: Message appears with English translation
7. **Generate summary**: Click the Summary button
8. **View AI summary**: Chief complaint, symptoms, medications, etc.

## Deployment

### Railway (Backend)
1. Connect GitHub repo
2. Set root directory to `backend`
3. Add environment variables
4. Deploy

### Vercel (Frontend)
1. Connect GitHub repo
2. Set root directory to `frontend`
3. Add environment variables with production URLs
4. Deploy

## License

MIT
