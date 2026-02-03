# Product Requirements Document (PRD)
## Healthcare Doctor–Patient Translation Web Application
### Nao Medical - Software Engineering Intern Assignment

---

## 📋 Document Information

| Field | Value |
|-------|-------|
| **Project Name** | MedTranslate - Healthcare Translation Bridge |
| **Version** | 1.0 |
| **Created** | February 4, 2026 |
| **Timeline** | 12 hours (targeting 2-hour completion with parallel agents) |
| **Author** | Nachiket Kulkarni |

---

## 1. Executive Summary

### 1.1 Problem Statement
Healthcare providers in New York serve diverse patient populations with limited English proficiency. Language barriers lead to:
- Miscommunication of symptoms and medical history
- Delayed diagnoses and treatment errors
- Patient anxiety and reduced trust
- Inefficient consultations requiring third-party interpreters

### 1.2 Solution
A real-time, AI-powered translation web application that enables seamless doctor-patient communication across language barriers, with features for audio recording, conversation persistence, and AI-generated medical summaries.

### 1.3 Success Metrics
- [ ] Functional real-time translation between English ↔ Spanish
- [ ] Audio recording with live transcription working
- [ ] Conversation history persists across sessions
- [ ] AI-generated medical summaries highlighting key points
- [ ] Deployed and accessible via public URL
- [ ] Clean, documented codebase on GitHub

---

## 2. Technical Architecture

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌─────────────────────┐       ┌─────────────────────┐              │
│  │   Doctor Interface  │       │  Patient Interface  │              │
│  │   (React + Vite)    │◄─────►│   (React + Vite)    │              │
│  │   - Chat UI         │  WS   │   - Chat UI         │              │
│  │   - Audio Recorder  │       │   - Audio Recorder  │              │
│  │   - Language Select │       │   - Language Select │              │
│  └──────────┬──────────┘       └──────────┬──────────┘              │
│             │                              │                         │
│             └──────────────┬───────────────┘                         │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │ HTTP/WebSocket
┌────────────────────────────┼─────────────────────────────────────────┐
│                         API LAYER                                    │
│                            ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  FastAPI Backend                             │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │    │
│  │  │ /translate  │ │ /summarize  │ │ /ws/conversation    │    │    │
│  │  │ REST API    │ │ REST API    │ │ WebSocket Handler   │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘    │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │    │
│  │  │ /messages   │ │ /search     │ │ /conversations      │    │    │
│  │  │ CRUD API    │ │ Search API  │ │ History API         │    │    │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│                      SERVICE LAYER                                   │
│             ┌──────────────┴──────────────┐                         │
│             ▼                              ▼                         │
│  ┌─────────────────────┐       ┌─────────────────────┐              │
│  │   OpenRouter API    │       │   SQLite Database   │              │
│  │   - Translation     │       │   - Conversations   │              │
│  │   - Summarization   │       │   - Messages        │              │
│  │                     │       │   - Audio metadata  │              │
│  └─────────────────────┘       └─────────────────────┘              │
│                                                                      │
│  ┌─────────────────────┐       ┌─────────────────────┐              │
│  │  Web Speech API     │       │   File Storage      │              │
│  │  (Browser-native)   │       │   - Audio files     │              │
│  │  - Live STT         │       │   - /uploads dir    │              │
│  └─────────────────────┘       └─────────────────────┘              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React 18 + Vite | Fast dev server, modern React features |
| **Styling** | Tailwind CSS | Rapid UI development, matches Nao Medical aesthetic |
| **Backend** | Python FastAPI | Aligns with JD requirements, async support, WebSockets |
| **Database** | SQLite | Zero-config, file-based, sufficient for demo |
| **Real-time** | WebSockets (FastAPI) | Native support, bi-directional communication |
| **AI/LLM** | OpenRouter API | Multi-model access, cost-effective |
| **Speech-to-Text** | Web Speech API (Browser) | Free, no API key, real-time streaming |
| **Audio Storage** | Local filesystem | Simple, reliable for demo |
| **Frontend Deploy** | Vercel | 1-click deploy, global CDN |
| **Backend Deploy** | Railway | Free tier, Python support, easy setup |

### 2.3 AI Model Selection (OpenRouter)

| Task | Primary Model | Fallback | Rationale |
|------|---------------|----------|-----------|
| **Translation** | `anthropic/claude-3-haiku` | `openai/gpt-3.5-turbo` | Fast, accurate, cost-effective |
| **Medical Summary** | `anthropic/claude-3-sonnet` | `openai/gpt-4-turbo` | Better reasoning for medical context |
| **General Fallback** | `mistralai/mistral-7b-instruct` | - | Open source backup |

### 2.4 Data Models

```python
# Conversation
{
    "id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "doctor_language": "en",
    "patient_language": "es",
    "status": "active" | "completed",
    "summary": "string | null"
}

# Message
{
    "id": "uuid",
    "conversation_id": "uuid",
    "role": "doctor" | "patient",
    "original_text": "string",
    "translated_text": "string",
    "original_language": "en" | "es",
    "target_language": "es" | "en",
    "audio_url": "string | null",
    "is_audio_message": "boolean",
    "created_at": "timestamp"
}

# Audio Record
{
    "id": "uuid",
    "message_id": "uuid",
    "file_path": "string",
    "duration_seconds": "float",
    "transcription": "string",
    "created_at": "timestamp"
}
```

---

## 3. Feature Specifications

### 3.1 Feature Priority Matrix

| Priority | Feature | Status | Complexity | Agent |
|----------|---------|--------|------------|-------|
| **P0** | Conversation History/Persistence | 🔴 Must Ship | Medium | Backend |
| **P0** | AI-Powered Medical Summary | 🔴 Must Ship | Medium | Backend |
| **P1** | Real-Time Translation (Text) | 🔴 Must Ship | Medium | Backend + Frontend |
| **P2** | Audio Recording & Playback | 🟡 Important | Medium | Frontend |
| **P3** | Live Speech-to-Text | 🟡 Important | High | Frontend |
| **P3** | Conversation Search | 🟢 Nice to Have | Low | Backend + Frontend |

### 3.2 Detailed Feature Specifications

---

#### Feature 3.2.1: Real-Time Translation

**Description**: Messages typed or spoken by Doctor/Patient are translated to the other party's language in near real-time.

**User Stories**:
- As a Doctor, I want to type in English and have my message instantly appear in Spanish for the Patient
- As a Patient, I want to see the original message and its translation side-by-side
- As a user, I want to switch my preferred language at any time

**Acceptance Criteria**:
- [ ] Translation latency < 2 seconds for messages under 500 characters
- [ ] Support English ↔ Spanish bidirectional translation
- [ ] Display both original and translated text
- [ ] Handle translation errors gracefully with retry option

**API Endpoint**:
```
POST /api/translate
{
    "text": "Hello, how are you feeling today?",
    "source_language": "en",
    "target_language": "es"
}
Response:
{
    "original": "Hello, how are you feeling today?",
    "translated": "Hola, ¿cómo se siente hoy?",
    "source_language": "en",
    "target_language": "es"
}
```

**UI Components**:
- Language selector dropdown (per user role)
- Message bubble with original + translation
- Loading state during translation

---

#### Feature 3.2.2: Text Chat Interface

**Description**: Clean, intuitive chat UI with clear visual distinction between Doctor and Patient messages.

**User Stories**:
- As a user, I want to immediately identify who sent each message
- As a user, I want a familiar chat interface similar to WhatsApp/iMessage
- As a user, I want to see timestamps on messages

**Acceptance Criteria**:
- [ ] Doctor messages: Right-aligned, Navy blue (#1B2B41) background
- [ ] Patient messages: Left-aligned, Green (#8CD867) background
- [ ] Timestamps visible on hover or always shown
- [ ] Auto-scroll to newest message
- [ ] Mobile-responsive (works on 375px width)

**UI Specifications**:
```
┌─────────────────────────────────────────────────────────────┐
│  🏥 MedTranslate          [👤 Doctor ▼]  [🌐 English ▼]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │ Hola doctor, me duele la cabeza     │ 🎵  10:30 AM     │
│  │ ─────────────────────────────────── │                   │
│  │ Hello doctor, I have a headache     │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│                    ┌─────────────────────────────────────┐ │
│       10:31 AM  🎵 │ When did the headache start?        │ │
│                    │ ─────────────────────────────────── │ │
│                    │ ¿Cuándo empezó el dolor de cabeza? │ │
│                    └─────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [🎤]  Type your message...                        [Send ➤] │
└─────────────────────────────────────────────────────────────┘
```

---

#### Feature 3.2.3: Audio Recording & Storage

**Description**: Record audio directly from browser, store for playback within conversation thread.

**User Stories**:
- As a Doctor, I want to record voice messages when typing is inconvenient
- As a Patient, I want to hear the original audio of what was said
- As a user, I want to see audio messages integrated in the chat flow

**Acceptance Criteria**:
- [ ] Record button initiates browser microphone access
- [ ] Visual feedback during recording (pulsing indicator, timer)
- [ ] Recorded audio appears as playable element in chat
- [ ] Audio files stored server-side with conversation reference
- [ ] Support common formats (webm, mp3, wav)

**Technical Implementation**:
```javascript
// Browser MediaRecorder API
const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
});
```

**UI Components**:
- Record button (mic icon)
- Recording indicator with timer
- Audio player embedded in message bubble
- Stop/Cancel recording controls

---

#### Feature 3.2.4: Live Speech-to-Text

**Description**: Real-time transcription as user speaks, using browser's Web Speech API.

**User Stories**:
- As a Doctor, I want to speak naturally and see my words transcribed live
- As a Patient, I want hands-free input when I'm not feeling well
- As a user, I want to edit the transcription before sending

**Acceptance Criteria**:
- [ ] Speech recognition starts when mic button is pressed
- [ ] Live text appears in input field as user speaks
- [ ] Support English and Spanish speech recognition
- [ ] User can edit transcribed text before sending
- [ ] Clear visual indicator of listening state

**Technical Implementation**:
```javascript
// Web Speech API (FREE, no API key needed)
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US'; // or 'es-ES'
```

**Fallback**: If Web Speech API unavailable, show "Speech recognition not supported" message with option to type manually.

---

#### Feature 3.2.5: Conversation Logging & Persistence

**Description**: All interactions logged with timestamps, persisting beyond active session.

**User Stories**:
- As a Doctor, I want to review past conversations with patients
- As a user, I want my conversation history saved automatically
- As a Doctor, I want to continue a previous conversation

**Acceptance Criteria**:
- [ ] All messages saved to SQLite database
- [ ] Conversations persist across browser refresh
- [ ] Conversation list shows date, preview, participants
- [ ] Load previous conversation restores full history
- [ ] Delete conversation option available

**Database Schema**:
```sql
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doctor_language TEXT DEFAULT 'en',
    patient_language TEXT DEFAULT 'es',
    status TEXT DEFAULT 'active',
    summary TEXT
);

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id),
    role TEXT CHECK(role IN ('doctor', 'patient')),
    original_text TEXT,
    translated_text TEXT,
    original_language TEXT,
    target_language TEXT,
    audio_url TEXT,
    is_audio_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### Feature 3.2.6: Conversation Search

**Description**: Search keywords/phrases across logged conversations with highlighted results.

**User Stories**:
- As a Doctor, I want to find conversations mentioning specific symptoms
- As a user, I want matched text highlighted in search results
- As a user, I want to jump directly to the relevant message

**Acceptance Criteria**:
- [ ] Search input in conversation list view
- [ ] Results show conversation + matching message preview
- [ ] Search term highlighted in results
- [ ] Search across both original and translated text
- [ ] Debounced search (300ms delay)

**API Endpoint**:
```
GET /api/search?q=headache&limit=20
Response:
{
    "results": [
        {
            "conversation_id": "uuid",
            "message_id": "uuid",
            "snippet": "...I have a terrible <mark>headache</mark> that started...",
            "created_at": "timestamp"
        }
    ],
    "total": 5
}
```

---

#### Feature 3.2.7: AI-Powered Medical Summary

**Description**: Generate concise summary highlighting medically important points.

**User Stories**:
- As a Doctor, I want a quick summary of key medical information discussed
- As a Doctor, I want symptoms, medications, and follow-ups highlighted
- As a user, I want to generate summary at any point in conversation

**Acceptance Criteria**:
- [ ] "Generate Summary" button available during/after conversation
- [ ] Summary includes: Chief Complaint, Symptoms, Duration, Medications mentioned, Allergies, Follow-up actions
- [ ] Summary formatted in structured, scannable format
- [ ] Summary saved with conversation record
- [ ] Option to regenerate/update summary

**API Endpoint**:
```
POST /api/summarize
{
    "conversation_id": "uuid"
}
Response:
{
    "summary": {
        "chief_complaint": "Persistent headache",
        "symptoms": ["Headache", "Nausea", "Light sensitivity"],
        "duration": "3 days",
        "medications_mentioned": ["Ibuprofen"],
        "allergies": ["Penicillin"],
        "follow_up": ["Schedule MRI", "Return if symptoms worsen"],
        "raw_summary": "Patient presents with a 3-day history of..."
    }
}
```

**UI Component**:
```
┌─────────────────────────────────────────────────────────────┐
│  📋 Medical Summary                              [Regenerate]│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🎯 Chief Complaint                                         │
│  Persistent headache with associated symptoms               │
│                                                              │
│  🩺 Symptoms Reported                                       │
│  • Headache (throbbing, bilateral)                          │
│  • Nausea                                                    │
│  • Light sensitivity (photophobia)                          │
│                                                              │
│  ⏱️ Duration: 3 days                                        │
│                                                              │
│  💊 Medications Mentioned                                   │
│  • Ibuprofen 400mg (limited relief)                         │
│                                                              │
│  ⚠️ Allergies                                               │
│  • Penicillin                                                │
│                                                              │
│  📅 Follow-up Actions                                       │
│  • Schedule MRI if symptoms persist                         │
│  • Return visit in 1 week                                   │
│  • Avoid bright screens                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. UI/UX Design Specifications

### 4.1 Brand Alignment (Nao Medical)

**Color Palette**:
| Name | Hex | Usage |
|------|-----|-------|
| Primary Green | `#8CD867` | CTAs, accents, Patient messages |
| Primary Navy | `#1B2B41` | Headings, Doctor messages |
| Text Body | `#4A4A4A` | Body copy |
| Background | `#FFFFFF` | Main background |
| Card Background | `#F8F9FA` | Cards, alternate sections |
| Star/Accent | `#FFC107` | Ratings, highlights |

**Typography**:
| Type | Font | Weight | Usage |
|------|------|--------|-------|
| Headings | Playfair Display | 700 | Page titles, section headers |
| Body | Inter | 400, 500 | Navigation, messages, UI |
| Accent | Dancing Script | 400 | Humanizing accents |

### 4.2 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, full-width chat |
| Tablet | 640px - 1024px | Side panel collapsible |
| Desktop | > 1024px | Sidebar + Main chat area |

### 4.3 Component Library

Using **Tailwind CSS** with custom configuration matching Nao Medical brand.

Key components:
- `MessageBubble` - Doctor/Patient variants
- `AudioPlayer` - Embedded audio playback
- `RecordButton` - Mic with recording state
- `LanguageSelector` - Dropdown for language
- `ConversationList` - Sidebar history
- `SummaryPanel` - Medical summary display
- `SearchBar` - With highlighted results

---

## 5. API Specifications

### 5.1 REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/translate` | Translate text between languages |
| `POST` | `/api/summarize` | Generate medical summary |
| `GET` | `/api/conversations` | List all conversations |
| `POST` | `/api/conversations` | Create new conversation |
| `GET` | `/api/conversations/{id}` | Get conversation with messages |
| `DELETE` | `/api/conversations/{id}` | Delete conversation |
| `POST` | `/api/messages` | Add message to conversation |
| `POST` | `/api/audio/upload` | Upload audio file |
| `GET` | `/api/audio/{id}` | Stream audio file |
| `GET` | `/api/search` | Search across conversations |

### 5.2 WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_conversation` | Client → Server | `{ conversation_id, role }` |
| `leave_conversation` | Client → Server | `{ conversation_id }` |
| `send_message` | Client → Server | `{ text, role, is_audio }` |
| `new_message` | Server → Client | `{ message object }` |
| `typing` | Bidirectional | `{ role, is_typing }` |
| `error` | Server → Client | `{ error, message }` |

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Translation API response: < 2 seconds
- Page load time: < 3 seconds
- WebSocket message delivery: < 500ms
- Audio upload: < 5 seconds for 1-minute clip

### 6.2 Security
- CORS configured for frontend domain only
- Audio files not publicly accessible without auth
- No PHI/PII stored beyond conversation content
- Environment variables for all API keys

### 6.3 Accessibility
- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader friendly labels
- Sufficient color contrast (4.5:1 minimum)

### 6.4 Browser Support
- Chrome 90+ (primary)
- Firefox 90+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

---

## 7. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            React Frontend (Static)                   │    │
│  │            https://medtranslate.vercel.app          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Railway                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            FastAPI Backend                           │    │
│  │            https://medtranslate-api.railway.app     │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                 │    │
│  │  │   SQLite DB  │  │ Audio Files  │                 │    │
│  │  │  /data/db    │  │ /data/audio  │                 │    │
│  │  └──────────────┘  └──────────────┘                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenRouter API                            │
│              https://openrouter.ai/api/v1                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenRouter API downtime | Low | High | Implement retry logic, show cached translations |
| Web Speech API browser incompatibility | Medium | Medium | Fallback to manual typing, detect support |
| WebSocket connection drops | Medium | Medium | Auto-reconnect logic, offline message queue |
| Time constraint (12 hours) | High | High | Prioritize P0 features, parallel development |
| Railway free tier limits | Low | Medium | Monitor usage, optimize queries |

---

## 9. Success Criteria Checklist

### Must Have (P0) - Ship or Fail
- [ ] Two-role interface (Doctor/Patient)
- [ ] Real-time text translation (English ↔ Spanish)
- [ ] Conversation persistence (survives refresh)
- [ ] AI-generated medical summary
- [ ] Deployed and accessible via public URL
- [ ] README with setup instructions

### Should Have (P1-P2) - Strong Submission
- [ ] Audio recording in browser
- [ ] Audio playback in chat
- [ ] Live speech-to-text
- [ ] Mobile-responsive design
- [ ] Conversation history list

### Nice to Have (P3) - Impressive Submission
- [ ] Conversation search with highlighting
- [ ] Google authentication
- [ ] Multiple language pairs
- [ ] Export conversation as PDF
- [ ] Typing indicators

---

## 10. Appendix

### 10.1 Environment Variables

```env
# Backend (.env)
OPENROUTER_API_KEY=sk-or-...
DATABASE_URL=sqlite:///./data/medtranslate.db
ALLOWED_ORIGINS=https://medtranslate.vercel.app
AUDIO_STORAGE_PATH=./data/audio

# Frontend (.env.local)
VITE_API_URL=https://medtranslate-api.railway.app
VITE_WS_URL=wss://medtranslate-api.railway.app
```

### 10.2 OpenRouter API Usage

```python
import httpx

async def translate(text: str, source: str, target: str) -> str:
    response = await httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "anthropic/claude-3-haiku",
            "messages": [
                {
                    "role": "system",
                    "content": f"You are a medical translator. Translate the following from {source} to {target}. Only output the translation, nothing else."
                },
                {
                    "role": "user", 
                    "content": text
                }
            ]
        }
    )
    return response.json()["choices"][0]["message"]["content"]
```

### 10.3 Demo Conversation Script

For demonstration purposes:

**Doctor (English)**: "Hello, how are you feeling today?"
**Patient (Spanish)**: "No me siento bien. Tengo dolor de cabeza muy fuerte."
**Doctor**: "When did the headache start?"
**Patient**: "Hace tres días. También tengo náuseas."
**Doctor**: "Are you taking any medications?"
**Patient**: "Solo ibuprofeno, pero no ayuda mucho."
**Doctor**: "Any allergies to medications?"
**Patient**: "Sí, soy alérgico a la penicilina."

---

*Document Version: 1.0 | Last Updated: February 4, 2026*
