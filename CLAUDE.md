# CLAUDE.md - MedTranslate Project

## Project Overview

MedTranslate is a real-time, AI-powered healthcare translation web application enabling seamless doctor-patient communication across language barriers. Built for the Nao Medical Software Engineering Intern Assessment.

**Core Features**:
- Real-time translation (English ↔ Spanish) via OpenRouter AI
- WebSocket-based live messaging between Doctor/Patient roles
- Audio recording with playback
- Live speech-to-text (Web Speech API)
- Conversation persistence (SQLite)
- AI-powered medical summaries

---

## Tech Stack Quick Reference

| Component | Technology | Key Files |
|-----------|------------|-----------|
| Backend | Python 3.11+ FastAPI | `backend/main.py` |
| Frontend | React 18 + Vite + TypeScript | `frontend/src/main.tsx` |
| Styling | Tailwind CSS | `frontend/tailwind.config.js` |
| Database | SQLite + SQLAlchemy | `backend/database.py` |
| AI/LLM | OpenRouter (Claude 3 Haiku/Sonnet) | `backend/services/openrouter_client.py` |
| Real-time | FastAPI WebSockets | `backend/websocket/manager.py` |
| Speech | Web Speech API (browser-native) | `frontend/src/hooks/useSpeechRecognition.ts` |

---

## Development Commands

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Add OPENROUTER_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # Set VITE_API_URL=http://localhost:8000
npm run dev
```

### Verification
```bash
# Backend health check
curl http://localhost:8000/health

# Translation test
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello doctor", "source_language": "en", "target_language": "es"}'
```

---

## Project Structure

```
nao_medical/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Pydantic settings
│   ├── database.py                # SQLite + SQLAlchemy setup
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment template
│   ├── models/
│   │   ├── __init__.py
│   │   ├── conversation.py        # Conversation ORM model
│   │   └── message.py             # Message ORM model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── conversation.py        # Pydantic request/response
│   │   └── message.py             # Pydantic request/response
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── conversations.py       # /api/conversations/*
│   │   ├── messages.py            # /api/messages/*
│   │   ├── translate.py           # /api/translate
│   │   ├── summarize.py           # /api/summarize
│   │   ├── audio.py               # /api/audio/*
│   │   └── search.py              # /api/search
│   ├── services/
│   │   ├── __init__.py
│   │   ├── openrouter_client.py   # OpenRouter API wrapper
│   │   ├── translation_service.py # Translation logic
│   │   ├── summary_service.py     # Summary generation
│   │   └── database_service.py    # DB operations
│   ├── websocket/
│   │   ├── __init__.py
│   │   ├── manager.py             # Connection manager
│   │   └── handlers.py            # Event handlers
│   └── prompts/
│       ├── translation.py         # Translation prompts
│       └── summary.py             # Summary prompts
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── vite-env.d.ts
│       ├── types/
│       │   └── index.ts           # TypeScript interfaces
│       ├── lib/
│       │   └── utils.ts           # Utility functions
│       ├── services/
│       │   ├── api.ts             # REST API client
│       │   └── websocket.ts       # WebSocket client
│       ├── context/
│       │   └── ChatContext.tsx    # Global state
│       ├── hooks/
│       │   ├── useConversation.ts
│       │   ├── useMessages.ts
│       │   ├── useWebSocket.ts
│       │   ├── useTranslate.ts
│       │   ├── useSummary.ts
│       │   ├── useAudioRecorder.ts
│       │   └── useSpeechRecognition.ts
│       ├── components/
│       │   ├── chat/
│       │   │   ├── ChatLayout.tsx
│       │   │   ├── MessageList.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── MessageInput.tsx
│       │   │   └── TypingIndicator.tsx
│       │   ├── sidebar/
│       │   │   ├── ConversationList.tsx
│       │   │   ├── ConversationItem.tsx
│       │   │   └── SearchBar.tsx
│       │   ├── controls/
│       │   │   ├── Header.tsx
│       │   │   ├── RoleSelector.tsx
│       │   │   └── LanguageSelector.tsx
│       │   ├── audio/
│       │   │   ├── RecordButton.tsx
│       │   │   ├── AudioPlayer.tsx
│       │   │   ├── RecordingIndicator.tsx
│       │   │   └── SpeechInput.tsx
│       │   ├── summary/
│       │   │   └── SummaryPanel.tsx
│       │   └── common/
│       │       ├── Button.tsx
│       │       ├── Modal.tsx
│       │       └── LoadingSpinner.tsx
│       └── pages/
│           ├── HomePage.tsx
│           └── ChatPage.tsx
│
├── docs/
│   └── qa_checklist.md
├── files/
│   ├── PRD.md
│   ├── PHASES.md
│   └── TECH_DECISIONS.md
├── ticket.md
├── IMPLEMENTATION_PLAN.md         # Detailed tickets
├── railway.toml
├── vercel.json
└── README.md
```

---

## Code Patterns & Conventions

### Backend

**FastAPI Router Pattern**:
```python
# routers/conversations.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.conversation import ConversationCreate, ConversationResponse
from services import database_service

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

@router.post("/", response_model=ConversationResponse)
async def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db)
):
    return await database_service.create_conversation(db, data)
```

**Pydantic Schema Pattern**:
```python
# schemas/conversation.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal

class ConversationBase(BaseModel):
    doctor_language: str = "en"
    patient_language: str = "es"

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(ConversationBase):
    id: str
    created_at: datetime
    status: Literal["active", "completed"]
    summary: Optional[str] = None

    class Config:
        from_attributes = True
```

**SQLAlchemy Model Pattern**:
```python
# models/conversation.py
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base
import uuid

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    doctor_language = Column(String, default="en")
    patient_language = Column(String, default="es")
    status = Column(String, default="active")
    summary = Column(Text, nullable=True)
```

### Frontend

**React Component Pattern**:
```tsx
// components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  role: 'doctor' | 'patient';
  originalText: string;
  translatedText: string;
  timestamp: Date;
  audioUrl?: string;
}

export function MessageBubble({
  role,
  originalText,
  translatedText,
  timestamp,
  audioUrl
}: MessageBubbleProps) {
  const isDoctor = role === 'doctor';

  return (
    <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-4 ${
        isDoctor ? 'bg-nao-navy text-white' : 'bg-nao-green text-nao-navy'
      }`}>
        <p className="text-sm opacity-80">{originalText}</p>
        <hr className="my-2 opacity-30" />
        <p className="font-medium">{translatedText}</p>
        {audioUrl && <AudioPlayer src={audioUrl} />}
        <time className="text-xs opacity-60 mt-2 block">
          {formatTime(timestamp)}
        </time>
      </div>
    </div>
  );
}
```

**Custom Hook Pattern**:
```tsx
// hooks/useWebSocket.ts
export function useWebSocket(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/${conversationId}`);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message]);
      }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [conversationId]);

  const sendMessage = useCallback((text: string, role: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'send_message', text, role }));
  }, []);

  return { messages, isConnected, sendMessage };
}
```

---

## Nao Medical Brand Colors (Tailwind)

```javascript
// tailwind.config.js
colors: {
  'nao-green': '#8CD867',   // Patient messages, CTAs
  'nao-navy': '#1B2B41',    // Doctor messages, headings
  'nao-gray': '#4A4A4A',    // Body text
  'nao-light': '#F8F9FA',   // Card backgrounds
  'nao-star': '#FFC107',    // Highlights, ratings
}
```

---

## API Endpoints Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/translate` | Translate text |
| POST | `/api/summarize` | Generate medical summary |
| GET | `/api/conversations` | List all conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/{id}` | Get conversation + messages |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| POST | `/api/messages` | Create message |
| POST | `/api/audio/upload` | Upload audio file |
| GET | `/api/audio/{id}` | Stream audio file |
| GET | `/api/search?q={query}` | Search messages |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_conversation` | Client → Server | `{ conversation_id, role }` |
| `send_message` | Client → Server | `{ text, role, is_audio }` |
| `new_message` | Server → Client | `{ message object }` |
| `typing` | Bidirectional | `{ role, is_typing }` |

---

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

---

## Common Mistakes to Avoid

### Backend

1. **Wrong SQLAlchemy import for async**:
   - Wrong: `from sqlalchemy.orm import Session`
   - For async: `from sqlalchemy.ext.asyncio import AsyncSession`

2. **Missing CORS for WebSocket**:
   - WebSocket connections also need CORS handling
   - Add `allow_origins` in CORSMiddleware

3. **Forgetting to await async operations**:
   ```python
   # Wrong
   result = db.execute(query)
   # Correct
   result = await db.execute(query)
   ```

4. **Not handling OpenRouter rate limits**:
   - Add retry logic with exponential backoff
   - Cache repeated translations

### Frontend

1. **Not cleaning up WebSocket connections**:
   ```tsx
   useEffect(() => {
     const ws = new WebSocket(url);
     return () => ws.close();  // Always cleanup!
   }, []);
   ```

2. **Missing type declarations for Web Speech API**:
   - Add to `vite-env.d.ts`:
   ```tsx
   interface Window {
     SpeechRecognition: typeof SpeechRecognition;
     webkitSpeechRecognition: typeof SpeechRecognition;
   }
   ```

3. **Forgetting to handle unsupported browsers**:
   ```tsx
   if (!('webkitSpeechRecognition' in window)) {
     return <FallbackComponent />;
   }
   ```

---

## Testing Approach

### Backend Manual Tests
```bash
# Health check
curl http://localhost:8000/health

# Create conversation
curl -X POST http://localhost:8000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"doctor_language": "en", "patient_language": "es"}'

# Translate
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "I have a headache", "source_language": "en", "target_language": "es"}'
```

### Frontend Manual Tests
1. Open http://localhost:5173
2. Verify Doctor/Patient role toggle works
3. Send a message and confirm translation appears
4. Test audio recording button (check mic permission)
5. Test speech-to-text (Chrome/Edge only)

### WebSocket Test
```javascript
// Browser console
const ws = new WebSocket('ws://localhost:8000/ws/test-123');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ type: 'send_message', text: 'Hello', role: 'doctor' }));
```

---

## Deployment

### Railway (Backend)
1. Connect GitHub repo
2. Set root directory to `backend`
3. Add environment variables
4. Railway auto-detects Python

### Vercel (Frontend)
1. Connect GitHub repo
2. Set root directory to `frontend`
3. Add environment variables with production URLs
4. Vercel auto-detects Vite

---

## Quick Debug Commands

```bash
# Check if backend is running
lsof -i :8000

# Check if frontend is running
lsof -i :5173

# View SQLite database
sqlite3 backend/data/medtranslate.db ".tables"
sqlite3 backend/data/medtranslate.db "SELECT * FROM conversations;"

# Tail backend logs
tail -f backend/app.log
```

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## File Reference Guide for Sub-Agents

When implementing this project, sub-agents should refer to these files in this priority order:

### 1. **CLAUDE.md** (This File) - PRIMARY REFERENCE
**Use for:** Day-to-day implementation work
- Code patterns and conventions
- API endpoint references
- Environment variables
- Common mistakes to avoid
- Quick debug commands
- Implementation tickets (T-0001 through T-5007)
- **Start here for any implementation task**

### 2. **ticket.md** - HIGH-LEVEL OVERVIEW
**Use for:** Understanding the big picture
- Workstream organization (WS1-WS5)
- Quick ticket list without deep details
- Parallel vs serial dependencies
- **Reference when planning agent assignments**

### 3. **files/PRD.md** - PRODUCT REQUIREMENTS
**Use for:** Understanding features and UX
- Feature specifications and user stories
- UI/UX design specifications
- Color palette and typography
- API specifications (high-level)
- Demo conversation script
- **Reference when unclear on feature behavior**

### 4. **files/PHASES.md** - ORIGINAL PHASE PLANNING
**Use for:** Alternative view of implementation
- Original phase breakdown
- Code templates and examples
- Progress tracking checklist
- **Legacy reference - prefer CLAUDE.md for implementation**

### 5. **files/TECH_DECISIONS.md** - ARCHITECTURE RATIONALE
**Use for:** Understanding why decisions were made
- Stack selection rationale
- Pattern explanations
- Trade-offs accepted
- Security considerations
- **Reference when questioning architecture choices**

### Quick Decision Tree:
```
Implementing a ticket? → CLAUDE.md (find the ticket section)
Need to assign work? → ticket.md (see workstreams)
Unclear on feature? → files/PRD.md (read feature spec)
Questioning a choice? → files/TECH_DECISIONS.md
Want code templates? → files/PHASES.md
```

---

## Implementation Tickets

### Phase 1: Bootstrap (Serial)

**T-0001: Repository Structure & Baseline Configuration**
- **Status**: Required First
- **Parallelizable**: No
- **Estimated Time**: 10 minutes
- **Scope**: Create `/backend` and `/frontend` directory structures

#### Backend Directory Structure
```
backend/
├── main.py                 # FastAPI app entry point
├── config.py              # Pydantic settings
├── database.py            # SQLite connection setup
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── models/
│   ├── __init__.py
│   ├── conversation.py    # Conversation model
│   └── message.py         # Message model
├── schemas/
│   ├── __init__.py
│   ├── conversation.py    # Pydantic schemas
│   └── message.py         # Pydantic schemas
├── routers/
│   ├── __init__.py
│   ├── conversations.py   # /api/conversations/*
│   ├── messages.py        # /api/messages/*
│   ├── search.py          # /api/search
│   └── audio.py           # /api/audio/*
├── services/
│   ├── __init__.py
│   ├── openrouter_client.py
│   ├── translation_service.py
│   └── database_service.py
└── websocket/
    ├── __init__.py
    ├── manager.py         # Connection manager
    └── handlers.py        # Event handlers
```

#### Frontend Directory Structure
```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── types/
    │   └── index.ts
    ├── lib/
    │   └── utils.ts
    ├── services/
    │   ├── api.ts
    │   └── websocket.ts
    ├── context/
    │   └── ChatContext.tsx
    ├── hooks/
    │   ├── useConversation.ts
    │   ├── useMessages.ts
    │   ├── useWebSocket.ts
    │   ├── useTranslate.ts
    │   ├── useSummary.ts
    │   ├── useAudioRecorder.ts
    │   └── useSpeechRecognition.ts
    ├── components/
    │   ├── chat/
    │   │   ├── ChatLayout.tsx
    │   │   ├── MessageList.tsx
    │   │   ├── MessageBubble.tsx
    │   │   ├── MessageInput.tsx
    │   │   └── TypingIndicator.tsx
    │   ├── sidebar/
    │   │   ├── ConversationList.tsx
    │   │   ├── ConversationItem.tsx
    │   │   └── SearchBar.tsx
    │   ├── controls/
    │   │   ├── Header.tsx
    │   │   ├── RoleSelector.tsx
    │   │   └── LanguageSelector.tsx
    │   ├── audio/
    │   │   ├── RecordButton.tsx
    │   │   ├── AudioPlayer.tsx
    │   │   └── SpeechInput.tsx
    │   └── summary/
    │       └── SummaryPanel.tsx
    └── pages/
        ├── HomePage.tsx
        └── ChatPage.tsx
```

#### Acceptance Criteria
- [ ] `backend/` and `frontend/` directories exist
- [ ] All subdirectories created with `.gitkeep` where needed
- [ ] `.gitignore` files configured for Python and Node.js

---

### Phase 2: Parallel Foundation

Run these 5 agents simultaneously after T-0001 completes:

#### T-1001: FastAPI Application Skeleton
**Workstream**: WS1 Backend Core
**Parallelizable**: Yes (after T-0001)
**Estimated Time**: 15 minutes
**Depends on**: T-0001

**Files to Create:**
- `backend/requirements.txt` - fastapi, uvicorn, pydantic, pydantic-settings, sqlalchemy, aiosqlite, httpx, python-multipart
- `backend/config.py` - Pydantic Settings for env vars
- `backend/main.py` - FastAPI app with CORS and /health endpoint
- `backend/.env.example` - Environment template

**Acceptance:**
- [ ] `GET /health` returns `{"status": "ok", "version": "1.0.0"}`

---

#### T-2001: Vite + React + Tailwind Setup
**Workstream**: WS2 Frontend Core
**Parallelizable**: Yes (after T-0001)
**Estimated Time**: 15 minutes
**Depends on**: T-0001

**Commands:**
```bash
cd frontend
npm create vite@latest . -- --template react-ts --force
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom lucide-react @tanstack/react-query axios
```

**Files to Create:**
- `frontend/tailwind.config.js` - Nao Medical colors
- `frontend/src/index.css` - Tailwind imports + custom styles
- `frontend/src/main.tsx` - React entry with QueryClient
- `frontend/src/App.tsx` - Basic routing
- `frontend/src/types/index.ts` - TypeScript interfaces

**Acceptance:**
- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes apply correctly

---

#### T-3001: OpenRouter Client & Configuration
**Workstream**: WS3 AI Services
**Parallelizable**: Yes (after T-0001)
**Estimated Time**: 15 minutes
**Depends on**: T-1001 (config pattern)

**Files to Create:**
- `backend/services/ai_config.py` - ModelConfig dataclass, MODELS dict
- `backend/services/openrouter_client.py` - OpenRouterClient with retry logic

**Features:**
- chat_completion with exponential backoff
- Custom exceptions: OpenRouterError, RateLimitError, AuthenticationError
- Health check method

**Acceptance:**
- [ ] Can make test API call to OpenRouter
- [ ] Proper error handling for auth/timeout/rate limit

---

#### T-4001: Audio Recorder Hook & Components
**Workstream**: WS4 Audio & Speech
**Parallelizable**: Yes (after T-0001)
**Estimated Time**: 20 minutes
**Depends on**: T-2001

**Files to Create:**
- `frontend/src/hooks/useAudioRecorder.ts` - MediaRecorder hook
- `frontend/src/components/audio/AudioPlayer.tsx` - Playback component
- `frontend/src/components/audio/RecordButton.tsx` - Record button with states

**Features:**
- startRecording, stopRecording, resetRecording
- Duration tracking
- Error handling for permissions

**Acceptance:**
- [ ] Microphone permission requested
- [ ] Audio blob created successfully
- [ ] Playback works

---

#### T-4002: Live Speech-to-Text
**Workstream**: WS4 Audio & Speech
**Parallelizable**: Yes (after T-0001)
**Estimated Time**: 20 minutes
**Depends on**: T-2001

**Files to Create:**
- `frontend/src/hooks/useSpeechRecognition.ts` - Web Speech API hook
- `frontend/src/components/audio/SpeechInput.tsx` - Speech input component

**Features:**
- Support continuous and interim results
- Language parameter (en-US, es-ES)
- Fallback for unsupported browsers

**Acceptance:**
- [ ] Speech recognition works in Chrome/Edge
- [ ] Transcript appears live as user speaks

---

### Phase 3: Core Features

#### T-1002: SQLite Setup + Models
**Workstream**: WS1 Backend Core
**Parallelizable**: Yes (after T-1001)
**Estimated Time**: 20 minutes
**Depends on**: T-1001

**Files to Create:**
- `backend/database.py` - SQLAlchemy async setup
- `backend/models/conversation.py` - Conversation ORM model
- `backend/models/message.py` - Message ORM model
- `backend/schemas/conversation.py` - Pydantic schemas
- `backend/schemas/message.py` - Pydantic schemas

**Models:**
- Conversation: id, created_at, updated_at, doctor_language, patient_language, status, summary
- Message: id, conversation_id, role, original_text, translated_text, audio_url, created_at

**Acceptance:**
- [ ] Database file created on startup
- [ ] Tables created with correct schema
- [ ] Foreign key constraints work

---

#### T-1003: REST API - Conversations + Messages
**Workstream**: WS1 Backend Core
**Parallelizable**: Yes (after T-1002)
**Estimated Time**: 25 minutes
**Depends on**: T-1002

**Files to Create:**
- `backend/services/database_service.py` - Database operations
- `backend/routers/conversations.py` - CRUD endpoints
- `backend/routers/messages.py` - Message endpoints

**Endpoints:**
- `POST /api/conversations` - Create
- `GET /api/conversations` - List
- `GET /api/conversations/{id}` - Get with messages
- `PATCH /api/conversations/{id}` - Update
- `DELETE /api/conversations/{id}` - Delete
- `POST /api/messages` - Create message

**Acceptance:**
- [ ] All CRUD operations work via curl/Postman

---

#### T-1004: REST API - Search
**Workstream**: WS1 Backend Core
**Parallelizable**: Yes (after T-1002)
**Estimated Time**: 15 minutes
**Depends on**: T-1002

**Files to Create:**
- `backend/routers/search.py` - Search endpoint

**Features:**
- Search across original_text and translated_text
- Highlight matching text with `<mark>` tags
- Pagination support

**Acceptance:**
- [ ] `GET /api/search?q=headache` returns highlighted snippets

---

#### T-1005: REST API - Audio Upload/Fetch
**Workstream**: WS1 Backend Core
**Parallelizable**: Yes (after T-1002)
**Estimated Time**: 15 minutes
**Depends on**: T-1002

**Files to Create:**
- `backend/routers/audio.py` - Audio endpoints

**Features:**
- `POST /api/audio/upload` - Upload file
- `GET /api/audio/{id}` - Stream file
- Support webm, wav, mp3, ogg
- File size validation (max 10MB)

**Acceptance:**
- [ ] Upload returns file ID
- [ ] Can stream audio by ID

---

#### T-1006: WebSocket Room Manager
**Workstream**: WS1 Backend Core
**Parallelizable**: Yes (after T-1001)
**Estimated Time**: 20 minutes
**Depends on**: T-1001

**Files to Create:**
- `backend/websocket/manager.py` - ConnectionManager class
- `backend/websocket/handlers.py` - Message handlers

**Features:**
- Connect/disconnect management by conversation_id
- Broadcast to all participants in room
- Typing indicators
- Auto-translate messages before broadcast

**Acceptance:**
- [ ] WebSocket connects at `/ws/{conversation_id}`
- [ ] Messages broadcast to all participants
- [ ] Typing events propagate

---

#### T-2002: Chat Interface Components
**Workstream**: WS2 Frontend Core
**Parallelizable**: Yes (after T-2001)
**Estimated Time**: 40 minutes
**Depends on**: T-2001

**Files to Create:**
- `frontend/src/components/chat/MessageBubble.tsx` - Doctor (navy) and Patient (green) variants
- `frontend/src/components/chat/MessageList.tsx` - Scrollable container
- `frontend/src/components/chat/MessageInput.tsx` - Input with send button
- `frontend/src/components/chat/ChatLayout.tsx` - Main layout
- `frontend/src/components/sidebar/ConversationList.tsx` - Sidebar list
- `frontend/src/components/controls/RoleSelector.tsx` - Doctor/Patient toggle
- `frontend/src/components/controls/LanguageSelector.tsx` - Language dropdown

**Acceptance:**
- [ ] UI matches PRD colors
- [ ] Doctor messages right-aligned, Patient left-aligned
- [ ] Auto-scroll to newest message

---

#### T-2003: App Pages + Routing
**Workstream**: WS2 Frontend Core
**Parallelizable**: Yes (after T-2001)
**Estimated Time**: 20 minutes
**Depends on**: T-2001

**Files to Create:**
- `frontend/src/pages/HomePage.tsx` - Landing with conversation list
- `frontend/src/pages/ChatPage.tsx` - Main chat interface

**Acceptance:**
- [ ] Route `/` renders HomePage
- [ ] Route `/chat/:conversationId` renders ChatPage

---

#### T-2004: State + API Client
**Workstream**: WS2 Frontend Core
**Parallelizable**: Yes (after T-2001)
**Estimated Time**: 20 minutes
**Depends on**: T-2001

**Files to Create:**
- `frontend/src/services/api.ts` - Axios client
- `frontend/src/context/ChatContext.tsx` - Global state (role, language)
- `frontend/src/hooks/useConversation.ts` - Conversation CRUD
- `frontend/src/hooks/useMessages.ts` - Messages fetching
- `frontend/src/hooks/useTranslate.ts` - Translation API
- `frontend/src/hooks/useSummary.ts` - Summary generation

**Acceptance:**
- [ ] API client connects to backend
- [ ] Context provides state to components

---

#### T-3002: Translation Service + Endpoint
**Workstream**: WS3 AI Services
**Parallelizable**: Yes (after T-3001, T-1003)
**Estimated Time**: 25 minutes

**Files to Create:**
- `backend/prompts/translation.py` - Medical translation prompt
- `backend/services/translation_service.py` - Translation logic
- `backend/routers/translate.py` - `/api/translate` endpoint

**Features:**
- EN ↔ ES bidirectional translation
- Medical terminology preservation
- Response time < 2 seconds

**Acceptance:**
- [ ] Translation endpoint works
- [ ] Medical terms translated accurately

---

#### T-3003: Summary Service + Endpoint
**Workstream**: WS3 AI Services
**Parallelizable**: Yes (after T-3001, T-1003)
**Estimated Time**: 25 minutes

**Files to Create:**
- `backend/prompts/summary.py` - Medical summary prompt
- `backend/services/summary_service.py` - Summary generation
- `backend/routers/summarize.py` - `/api/summarize` endpoint

**Features:**
- Generate structured JSON summary
- Fields: chief_complaint, symptoms, duration, medications, allergies, follow_up
- Save to conversation record

**Acceptance:**
- [ ] Summary generates from conversation
- [ ] JSON structure parses correctly

---

#### T-4003: Audio + STT Integration
**Workstream**: WS4 Audio & Speech
**Parallelizable**: Yes (after T-2002, T-4001, T-4002)
**Estimated Time**: 20 minutes
**Depends on**: T-2002, T-4001, T-4002

**Integration Points:**
- Wire RecordButton into MessageInput
- Upload audio to backend on record complete
- Show AudioPlayer in MessageBubble for audio messages
- Speech input populates text field

**Acceptance:**
- [ ] Audio messages appear in chat with player
- [ ] Speech input populates text field

---

### Phase 4: Integration

#### T-5001: WebSocket Client Hook
**Workstream**: WS5 Integration
**Parallelizable**: Yes (after T-1006, T-2002)
**Estimated Time**: 20 minutes
**Depends on**: T-1006, T-2002

**Files to Create:**
- `frontend/src/hooks/useWebSocket.ts` - WebSocket client
- `frontend/src/services/websocket.ts` - WS service

**Features:**
- Auto-reconnect on disconnect
- Handle new_message, typing events
- Functions: sendMessage, sendTyping, joinConversation

**Acceptance:**
- [ ] Messages appear in real time
- [ ] Typing indicators visible

---

#### T-5002: End-to-End Translation Flow
**Workstream**: WS5 Integration
**Parallelizable**: No
**Estimated Time**: 20 minutes
**Depends on**: T-3002, T-1003, T-2004, T-5001

**Integration:**
- Wire up MessageInput to call translation API before sending
- Display both original and translated in MessageBubble
- Error handling with retry

**Acceptance:**
- [ ] Send message → translate → persist → display
- [ ] Original + translated text shown

---

#### T-5003: End-to-End Summary Flow
**Workstream**: WS5 Integration
**Parallelizable**: No
**Estimated Time**: 15 minutes
**Depends on**: T-3003, T-1003, T-2002

**Integration:**
- Create SummaryPanel component
- Display structured summary
- Regenerate button

**Acceptance:**
- [ ] Summary generates and displays
- [ ] Saves to conversation

---

#### T-5004: Conversation History + Search UI
**Workstream**: WS5 Integration
**Parallelizable**: Yes
**Estimated Time**: 15 minutes
**Depends on**: T-1004, T-1003, T-2002

**Integration:**
- Wire SearchBar to /api/search endpoint
- Display highlighted results
- Navigate to conversation on click

**Acceptance:**
- [ ] Search results show with highlights
- [ ] Can navigate to conversation

---

#### T-5005: Error Handling + Loading States
**Workstream**: WS5 Integration
**Parallelizable**: Yes
**Estimated Time**: 15 minutes
**Depends on**: T-2002, T-2004

**Files to Create:**
- `frontend/src/components/common/LoadingSpinner.tsx`
- `frontend/src/components/common/ErrorMessage.tsx`

**Features:**
- Consistent error UI across app
- Retry buttons for failed operations
- Loading spinners during async operations

**Acceptance:**
- [ ] All async operations show loading state
- [ ] Errors display with retry option

---

### Phase 5: Deployment

#### T-5006: Deployment Config + README
**Workstream**: WS5 Integration
**Parallelizable**: No
**Estimated Time**: 15 minutes
**Depends on**: T-1001, T-2001

**Files to Create:**
- `railway.toml` - Railway deployment config
- `vercel.json` - Vercel deployment config
- `README.md` - Setup instructions, features, tech stack

**Acceptance:**
- [ ] Backend deploys to Railway
- [ ] Frontend deploys to Vercel
- [ ] README is complete

---

#### T-5007: Smoke Tests + Demo Script
**Workstream**: WS5 Integration
**Parallelizable**: No
**Estimated Time**: 15 minutes
**Depends on**: T-5002, T-5003, T-4003

**Files to Create:**
- `docs/qa_checklist.md` - Manual QA checklist

**Demo Flow:**
1. Create conversation
2. Send message as Doctor (English)
3. See translation appear as Patient (Spanish)
4. Reply as Patient
5. Generate summary
6. Record audio message

**Acceptance:**
- [ ] All P0 features validated
- [ ] Demo script works end-to-end

---

## Parallel Execution Guide

### Dependency Graph

```
T-0001 (Bootstrap)
    │
    ├──────┬──────┬──────┬──────┐
    │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼
 T-1001  T-2001 T-3001 T-4001 T-4002
    │      │      │      │      │
    └──────┴──────┴──────┴──────┘
              │
              ▼
    ┌─────┬─────┬─────┐
    │     │     │     │
    ▼     ▼     ▼     ▼
  T-1002 T-2002 T-3002 T-4003
    │
    ▼
  T-1003/1004/1005/1006
    │
    ▼
  T-5001 → T-5002 → T-5003 → T-5004 → T-5005
                                          │
                                          ▼
                                        T-5006 → T-5007
```

### Batch Execution Commands

**Batch A** (After T-0001) - Run 5 agents in parallel:
```bash
# Agent 1
claude "Implement T-1001: FastAPI skeleton with health endpoint"

# Agent 2
claude "Implement T-2001: Vite + React + Tailwind setup"

# Agent 3
claude "Implement T-3001: OpenRouter client with retry logic"

# Agent 4
claude "Implement T-4001: Audio recorder hook and components"

# Agent 5
claude "Implement T-4002: Speech-to-text hook and UI"
```

**Batch B** (After Batch A) - Run 4 agents in parallel:
```bash
# Agent 1
claude "Implement T-1002: SQLite models and schemas"

# Agent 2
claude "Implement T-2002: Chat UI components"

# Agent 3
claude "Implement T-3002: Translation service and endpoint"

# Agent 4
claude "Implement T-2003 and T-2004: Pages and state management"
```

**Batch C** (After Batch B) - Run in sequence:
```bash
claude "Implement T-1003, T-1004, T-1005, T-1006: REST API and WebSocket"
claude "Implement T-5001: WebSocket client hook"
claude "Implement T-5002, T-5003, T-5004: Integration"
claude "Implement T-5005, T-5006, T-5007: Polish and deployment"
```

---

## Success Criteria

### P0 (Must Ship)
- [ ] Two-role interface (Doctor/Patient)
- [ ] Real-time text translation (English ↔ Spanish)
- [ ] Conversation persistence
- [ ] AI-generated medical summary
- [ ] Deployed to public URL
- [ ] README with setup instructions

### P1-P2 (Strong Submission)
- [ ] Audio recording in browser
- [ ] Audio playback in chat
- [ ] Live speech-to-text
- [ ] Mobile-responsive design
- [ ] Conversation history list

### P3 (Impressive)
- [ ] Conversation search with highlighting
- [ ] Typing indicators
- [ ] Multiple language pairs

