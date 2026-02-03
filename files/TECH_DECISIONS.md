# Technical Decisions Document
## MedTranslate - Architecture Rationale

---

## 1. Overview

This document explains the "why" behind each technical decision, providing context for coding agents and future maintainers.

---

## 2. Stack Decisions

### 2.1 Backend: Python FastAPI

**Decision**: Use FastAPI over Express.js, Django, or Flask

**Rationale**:
| Factor | FastAPI | Express.js | Django |
|--------|---------|------------|--------|
| JD Alignment | ✅ Python required | ❌ JS only | ✅ Python |
| Async Support | ✅ Native async/await | ✅ Good | ⚠️ Requires channels |
| WebSocket | ✅ Built-in | ✅ socket.io | ⚠️ Channels needed |
| API Docs | ✅ Auto Swagger/OpenAPI | ❌ Manual | ⚠️ DRF needed |
| Speed | ✅ Very fast | ✅ Fast | ⚠️ Heavier |
| Learning Curve | ✅ Simple | ✅ Simple | ⚠️ Steep |

**Trade-offs Accepted**:
- FastAPI ecosystem smaller than Django
- Less opinionated (need to choose ORM, auth, etc.)

---

### 2.2 Frontend: React + Vite

**Decision**: Use Vite over Create React App or Next.js

**Rationale**:
| Factor | Vite | Create React App | Next.js |
|--------|------|------------------|---------|
| Dev Server Speed | ✅ Instant HMR | ❌ Slow | ✅ Fast |
| Build Speed | ✅ Very fast | ❌ Slow | ✅ Fast |
| Complexity | ✅ Simple | ✅ Simple | ⚠️ More concepts |
| SSR Needed? | ❌ Not for this app | N/A | ✅ Overkill |
| Vercel Deploy | ✅ Native support | ✅ Works | ✅ Native |

**Trade-offs Accepted**:
- No server-side rendering (not needed for chat app)
- Manual routing setup (vs Next.js file-based routing)

---

### 2.3 Database: SQLite

**Decision**: Use SQLite over PostgreSQL, MongoDB, or Supabase

**Rationale**:
| Factor | SQLite | PostgreSQL | Supabase | MongoDB |
|--------|--------|------------|----------|---------|
| Setup Time | ✅ Zero config | ⚠️ Service needed | ✅ Quick | ⚠️ Service needed |
| Free Tier | ✅ File-based | ⚠️ Limited | ✅ Generous | ⚠️ Limited |
| Persistence | ✅ File survives restart | ✅ Yes | ✅ Yes | ✅ Yes |
| Sufficient for Demo | ✅ Yes | ✅ Overkill | ✅ Overkill | ✅ Overkill |
| Railway Compatible | ✅ With volume | ✅ Yes | N/A | ✅ Yes |

**Trade-offs Accepted**:
- No concurrent writes at scale (fine for demo)
- Must persist file on Railway (using volume mount)
- Would migrate to Postgres for production

**Migration Path**:
```python
# SQLite → PostgreSQL migration is easy with SQLAlchemy
# Just change connection string:
# sqlite:///./data/app.db → postgresql://user:pass@host/db
```

---

### 2.4 Real-Time: WebSockets (Native FastAPI)

**Decision**: Use FastAPI native WebSockets over Socket.io, Pusher, or Supabase Realtime

**Rationale**:
| Factor | FastAPI WS | Socket.io | Pusher | Supabase RT |
|--------|------------|-----------|--------|-------------|
| Cost | ✅ Free | ✅ Free | ⚠️ Paid | ✅ Free tier |
| Backend Coupling | ✅ Same process | ⚠️ Separate | ❌ External | ❌ External |
| Simplicity | ✅ Native | ⚠️ Extra lib | ✅ Managed | ✅ Managed |
| Latency | ✅ Minimal | ✅ Good | ⚠️ Network hop | ⚠️ Network hop |
| Room Management | ⚠️ Manual | ✅ Built-in | ✅ Built-in | ✅ Built-in |

**Trade-offs Accepted**:
- Manual connection management (implemented in `ConnectionManager` class)
- No automatic reconnection (client handles this)
- No horizontal scaling without Redis pub/sub (fine for demo)

---

### 2.5 AI/LLM: OpenRouter

**Decision**: Use OpenRouter over direct OpenAI, Anthropic, or self-hosted models

**Rationale**:
| Factor | OpenRouter | OpenAI Direct | Anthropic Direct | Self-Hosted |
|--------|------------|---------------|------------------|-------------|
| Model Variety | ✅ All models | ❌ GPT only | ❌ Claude only | ⚠️ Limited |
| Single API Key | ✅ Yes | ❌ Need OpenAI key | ❌ Need Anthropic key | N/A |
| Fallback Models | ✅ Easy switch | ❌ Manual | ❌ Manual | ❌ Manual |
| Cost | ✅ Pay per use | ✅ Pay per use | ✅ Pay per use | ⚠️ GPU costs |
| Setup Time | ✅ Instant | ✅ Instant | ✅ Instant | ❌ Hours |

**Model Selection**:
```
Translation: anthropic/claude-3-haiku
- Reason: Fast, cheap, excellent at instruction-following
- Fallback: openai/gpt-3.5-turbo

Summarization: anthropic/claude-3-sonnet  
- Reason: Better reasoning for medical context
- Fallback: openai/gpt-4-turbo
```

---

### 2.6 Speech-to-Text: Web Speech API

**Decision**: Use browser's Web Speech API over OpenAI Whisper or Google Cloud Speech

**Rationale**:
| Factor | Web Speech API | OpenAI Whisper | Google Cloud STT |
|--------|----------------|----------------|------------------|
| Cost | ✅ FREE | ⚠️ $0.006/min | ⚠️ $0.004-0.009/min |
| Latency | ✅ Real-time | ⚠️ After recording | ⚠️ Streaming extra |
| Setup | ✅ Zero config | ⚠️ API key | ⚠️ API key + setup |
| Accuracy | ⚠️ Good, not perfect | ✅ Excellent | ✅ Excellent |
| Languages | ✅ 100+ languages | ✅ 97 languages | ✅ 125+ languages |
| Browser Support | ⚠️ Chrome/Edge best | N/A | N/A |

**Trade-offs Accepted**:
- Accuracy lower than Whisper (acceptable for demo)
- Requires Chrome/Edge for best experience
- No offline support

**Fallback Strategy**:
```typescript
if (!('webkitSpeechRecognition' in window)) {
  // Show "Speech not supported" message
  // User can still type manually
}
```

---

### 2.7 Deployment: Vercel + Railway

**Decision**: Split deployment - Vercel (frontend) + Railway (backend)

**Rationale**:
| Factor | Vercel Only | Railway Only | Vercel + Railway |
|--------|-------------|--------------|------------------|
| Frontend Deploy | ✅ Perfect | ⚠️ Manual config | ✅ Perfect |
| Python Backend | ❌ Serverless limits | ✅ Native | ✅ Railway handles |
| WebSockets | ❌ Not supported | ✅ Yes | ✅ Railway handles |
| Free Tier | ✅ Generous | ✅ $5 credit | ✅ Both free |
| Global CDN | ✅ Yes | ⚠️ Single region | ✅ Frontend CDN |
| Custom Domain | ✅ Free | ✅ Free | ✅ Both |

**Why Not Single Platform**:
- Vercel can't run persistent Python processes or WebSockets well
- Railway alone lacks Vercel's frontend optimization and global CDN

---

## 3. Implementation Patterns

### 3.1 API Design Pattern

**Decision**: REST + WebSocket hybrid

```
REST API (Stateless operations):
├── GET  /conversations     → List
├── POST /conversations     → Create
├── GET  /conversations/:id → Read
├── DELETE /conversations/:id → Delete
├── POST /translate         → Translate text
├── POST /summarize         → Generate summary
├── POST /audio/upload      → Upload audio
└── GET  /search            → Search

WebSocket (Real-time operations):
└── WS /ws/:conversation_id
    ├── send_message   → Broadcast to room
    ├── typing         → Broadcast typing indicator
    └── new_message    → Receive messages
```

**Why Hybrid**:
- REST for CRUD: Simpler, cacheable, debuggable
- WebSocket for real-time: Instant updates, bidirectional

---

### 3.2 Error Handling Pattern

**Decision**: Consistent error response format

```python
# Backend error response
{
    "error": {
        "code": "TRANSLATION_FAILED",
        "message": "Unable to translate text",
        "details": "OpenRouter API timeout after 30s",
        "retry": true
    }
}

# Frontend handling
try {
  const result = await translate(text);
} catch (error) {
  if (error.retry) {
    showRetryButton();
  } else {
    showErrorMessage(error.message);
  }
}
```

---

### 3.3 State Management Pattern

**Decision**: React Query + Context (not Redux)

**Why Not Redux**:
- Overkill for this app size
- React Query handles server state excellently
- Context sufficient for UI state (role, language)

```typescript
// Server state: React Query
const { data: messages } = useQuery(['messages', conversationId], fetchMessages);

// UI state: Context
const { role, setRole, language, setLanguage } = useChatContext();

// Real-time state: WebSocket hook
const { liveMessages, sendMessage } = useWebSocket(conversationId);
```

---

## 4. Security Considerations

### 4.1 API Security

```python
# CORS: Restrict to known origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",        # Local dev
        "https://medtranslate.vercel.app"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting: Prevent abuse
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/translate")
@limiter.limit("30/minute")
async def translate(...):
    ...
```

### 4.2 Environment Variables

**Never commit these**:
```env
# .env (in .gitignore)
OPENROUTER_API_KEY=sk-or-...
DATABASE_URL=sqlite:///./data/medtranslate.db
```

**Use .env.example for templates**:
```env
# .env.example (committed)
OPENROUTER_API_KEY=your_key_here
DATABASE_URL=sqlite:///./data/medtranslate.db
```

---

## 5. Scalability Notes

### Current Architecture (Demo)
- Single SQLite file
- Single FastAPI process
- No caching
- In-memory WebSocket connections

### Production Evolution (Not Implemented)
```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                           │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ FastAPI │        │ FastAPI │        │ FastAPI │
   │ Node 1  │        │ Node 2  │        │ Node 3  │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐  ┌──────────┐
              │ PostgreSQL│ │  Redis   │
              │ (Primary) │ │ (Pub/Sub)│
              └──────────┘  └──────────┘
```

**Migration Path**:
1. SQLite → PostgreSQL (change connection string)
2. Add Redis for WebSocket pub/sub across nodes
3. Add load balancer (Railway handles this)
4. Add connection pooling

---

## 6. Testing Strategy (Time Permitting)

### Unit Tests
```python
# tests/test_translation.py
async def test_translate_english_to_spanish():
    result = await translate("Hello", "en", "es")
    assert "Hola" in result or "hola" in result
```

### Integration Tests
```python
# tests/test_websocket.py
async def test_websocket_message_broadcast():
    async with websocket_connect("/ws/test-room") as ws1:
        async with websocket_connect("/ws/test-room") as ws2:
            await ws1.send_json({"type": "send_message", "text": "Hello"})
            response = await ws2.receive_json()
            assert response["type"] == "new_message"
```

### Manual Testing Script
```bash
# Quick smoke test
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "source_language": "en", "target_language": "es"}'
```

---

## 7. Known Limitations & Future Improvements

| Limitation | Reason | Future Fix |
|------------|--------|------------|
| No authentication | Time constraint | Add Google OAuth |
| SQLite single-writer | Demo only | Migrate to Postgres |
| No message encryption | Complexity | Add E2E encryption |
| Limited language pairs | Demo scope | Add more languages |
| No offline support | WebSocket-dependent | Add service worker |
| No typing indicators | Polish feature | Implement with debounce |

---

*Document Version: 1.0 | February 4, 2026*
