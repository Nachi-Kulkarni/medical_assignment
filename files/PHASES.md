# 🚀 Implementation Phases
## Parallel Development Workstreams for Coding Agents

---

## Overview

This document breaks down the PRD into **4 parallel workstreams** that can be executed simultaneously by different coding agents. Each phase includes specific tasks, file outputs, and completion criteria.

**Total Estimated Time**: 2 hours with 4 parallel agents
**Sequential Equivalent**: ~6-8 hours

```
Timeline (Parallel Execution)
═══════════════════════════════════════════════════════════════════════════

Hour 1                              Hour 2
├─────────────────────────────────┼─────────────────────────────────────────┤

Agent 1 (Backend Core):
[█████ Setup █████][████████ APIs ████████][███ WebSocket ███]──────────────►

Agent 2 (Frontend Core):
[████ Setup ████][██████████ Chat UI ██████████][████ Polish ████]──────────►

Agent 3 (AI Services):
[██ Research ██][████ Translation ████][████ Summary ████][█ Test █]────────►

Agent 4 (Audio + Integration):
[████ Audio Recording ████][████ Speech-to-Text ████][█ Integration █]─────►

                                                                    │
                                                              DEPLOY ▼
```

---

## 🔵 AGENT 1: Backend Core Infrastructure

**Owner**: Backend Agent
**Dependencies**: None (starts immediately)
**Output Directory**: `/backend`

### Phase 1.1: Project Setup (15 min)

**Tasks**:
1. Initialize FastAPI project structure
2. Configure SQLite database
3. Set up CORS and middleware
4. Create environment configuration

**Files to Create**:
```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── config.py              # Configuration management
├── database.py            # SQLite connection setup
└── models/
    ├── __init__.py
    ├── conversation.py    # Conversation model
    └── message.py         # Message model
```

**Completion Criteria**:
- [ ] `uvicorn main:app --reload` runs without errors
- [ ] `/health` endpoint returns `{"status": "ok"}`
- [ ] SQLite database file created on startup

**Code Template - main.py**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MedTranslate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://medtranslate.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

### Phase 1.2: REST API Endpoints (30 min)

**Tasks**:
1. Implement conversation CRUD endpoints
2. Implement message endpoints
3. Implement search endpoint
4. Add audio file upload/retrieval

**Files to Create**:
```
backend/
├── routers/
│   ├── __init__.py
│   ├── conversations.py   # /api/conversations/*
│   ├── messages.py        # /api/messages/*
│   ├── search.py          # /api/search
│   └── audio.py           # /api/audio/*
├── schemas/
│   ├── __init__.py
│   ├── conversation.py    # Pydantic schemas
│   └── message.py         # Pydantic schemas
└── services/
    ├── __init__.py
    └── database_service.py # Database operations
```

**API Specifications**:

```python
# Conversations Router
@router.get("/conversations")
async def list_conversations() -> List[ConversationSummary]

@router.post("/conversations")
async def create_conversation(data: CreateConversation) -> Conversation

@router.get("/conversations/{id}")
async def get_conversation(id: str) -> ConversationWithMessages

@router.delete("/conversations/{id}")
async def delete_conversation(id: str) -> {"deleted": True}

# Messages Router
@router.post("/messages")
async def create_message(data: CreateMessage) -> Message

# Search Router
@router.get("/search")
async def search(q: str, limit: int = 20) -> SearchResults

# Audio Router
@router.post("/audio/upload")
async def upload_audio(file: UploadFile) -> AudioRecord

@router.get("/audio/{id}")
async def get_audio(id: str) -> FileResponse
```

**Completion Criteria**:
- [ ] All CRUD operations work via curl/Postman
- [ ] Search returns highlighted snippets
- [ ] Audio upload stores file and returns URL

---

### Phase 1.3: WebSocket Implementation (15 min)

**Tasks**:
1. Implement WebSocket connection manager
2. Handle join/leave conversation events
3. Broadcast messages to conversation participants
4. Add typing indicator support

**Files to Create**:
```
backend/
├── websocket/
│   ├── __init__.py
│   ├── manager.py         # Connection manager
│   └── handlers.py        # Event handlers
└── main.py                # Add WebSocket route
```

**WebSocket Events**:
```python
# Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, conversation_id: str):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)
    
    async def broadcast(self, conversation_id: str, message: dict):
        for connection in self.active_connections.get(conversation_id, []):
            await connection.send_json(message)

# WebSocket Route
@app.websocket("/ws/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: str):
    await manager.connect(websocket, conversation_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle message types: send_message, typing
            await handle_websocket_message(conversation_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)
```

**Completion Criteria**:
- [ ] WebSocket connects successfully
- [ ] Messages broadcast to all participants in same conversation
- [ ] Typing indicators work bidirectionally

---

## 🟢 AGENT 2: Frontend Core UI

**Owner**: Frontend Agent
**Dependencies**: None (starts immediately, mocks API initially)
**Output Directory**: `/frontend`

### Phase 2.1: Project Setup (10 min)

**Tasks**:
1. Initialize Vite + React + TypeScript project
2. Configure Tailwind CSS with Nao Medical theme
3. Set up routing (react-router-dom)
4. Create component structure

**Commands**:
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install tailwindcss postcss autoprefixer
npm install react-router-dom lucide-react
npm install @tanstack/react-query  # For API calls
npx tailwindcss init -p
```

**Files to Create**:
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              # Tailwind imports + custom styles
│   ├── components/
│   │   └── .gitkeep
│   ├── pages/
│   │   └── .gitkeep
│   ├── hooks/
│   │   └── .gitkeep
│   ├── services/
│   │   └── api.ts             # API client
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── lib/
│       └── utils.ts           # Utility functions
├── tailwind.config.js         # Nao Medical theme
├── .env.example
└── index.html
```

**Tailwind Config**:
```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'nao-green': '#8CD867',
        'nao-navy': '#1B2B41',
        'nao-gray': '#4A4A4A',
        'nao-light': '#F8F9FA',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'accent': ['Dancing Script', 'cursive'],
      },
    },
  },
  plugins: [],
}
```

**Completion Criteria**:
- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes apply correctly
- [ ] Basic routing works

---

### Phase 2.2: Chat Interface Components (40 min)

**Tasks**:
1. Build main chat layout (sidebar + main area)
2. Create MessageBubble component (Doctor/Patient variants)
3. Create MessageInput with send button
4. Create ConversationList sidebar
5. Build RoleSelector (Doctor/Patient toggle)
6. Build LanguageSelector dropdown

**Files to Create**:
```
frontend/src/
├── components/
│   ├── chat/
│   │   ├── ChatLayout.tsx         # Main layout wrapper
│   │   ├── MessageList.tsx        # Scrollable message container
│   │   ├── MessageBubble.tsx      # Individual message
│   │   ├── MessageInput.tsx       # Input + send button
│   │   └── TypingIndicator.tsx    # "Doctor is typing..."
│   ├── sidebar/
│   │   ├── ConversationList.tsx   # List of past conversations
│   │   ├── ConversationItem.tsx   # Single conversation preview
│   │   └── SearchBar.tsx          # Search conversations
│   ├── controls/
│   │   ├── RoleSelector.tsx       # Doctor/Patient toggle
│   │   ├── LanguageSelector.tsx   # Language dropdown
│   │   └── Header.tsx             # Top navigation bar
│   └── common/
│       ├── Button.tsx             # Reusable button
│       ├── Modal.tsx              # Modal wrapper
│       └── LoadingSpinner.tsx     # Loading state
├── pages/
│   ├── ChatPage.tsx               # Main chat page
│   └── HomePage.tsx               # Landing/conversation list
```

**MessageBubble Component Spec**:
```tsx
interface MessageBubbleProps {
  role: 'doctor' | 'patient';
  originalText: string;
  translatedText: string;
  timestamp: Date;
  audioUrl?: string;
  isAudioMessage: boolean;
}

// Doctor: Right-aligned, navy background
// Patient: Left-aligned, green background
// Show original + translated text with divider
// If audio, show embedded player
```

**Completion Criteria**:
- [ ] Chat UI matches wireframe in PRD
- [ ] Doctor/Patient messages visually distinct
- [ ] Message input sends on Enter key
- [ ] Scrolls to newest message

---

### Phase 2.3: State Management & API Integration (20 min)

**Tasks**:
1. Set up React Query for API calls
2. Create WebSocket hook for real-time updates
3. Integrate API calls with UI components
4. Handle loading and error states

**Files to Create**:
```
frontend/src/
├── hooks/
│   ├── useConversation.ts         # Conversation CRUD
│   ├── useMessages.ts             # Messages for conversation
│   ├── useWebSocket.ts            # WebSocket connection
│   ├── useTranslate.ts            # Translation API
│   └── useSummary.ts              # Summary generation
├── services/
│   ├── api.ts                     # Axios/fetch client
│   └── websocket.ts               # WebSocket client
└── context/
    └── ChatContext.tsx            # Global chat state
```

**useWebSocket Hook**:
```typescript
function useWebSocket(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/${conversationId}`);
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message]);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [conversationId]);

  const sendMessage = (text: string, role: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'send_message', text, role }));
  };

  return { messages, isConnected, sendMessage };
}
```

**Completion Criteria**:
- [ ] Real-time messages appear without refresh
- [ ] Loading states shown during API calls
- [ ] Errors displayed with retry option

---

## 🟡 AGENT 3: AI Services Integration

**Owner**: AI/ML Agent
**Dependencies**: Backend setup (Phase 1.1)
**Output Directory**: `/backend/services/`

### Phase 3.1: OpenRouter Setup & Research (10 min)

**Tasks**:
1. Research OpenRouter available models
2. Set up OpenRouter client
3. Test API connectivity
4. Document model choices

**Files to Create**:
```
backend/services/
├── openrouter_client.py      # OpenRouter API client
└── ai_config.py              # Model configurations
```

**OpenRouter Client**:
```python
import httpx
from config import settings

class OpenRouterClient:
    BASE_URL = "https://openrouter.ai/api/v1"
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://medtranslate.vercel.app",
            "X-Title": "MedTranslate Healthcare App"
        }
    
    async def chat_completion(
        self, 
        messages: list, 
        model: str = "anthropic/claude-3-haiku"
    ) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers=self.headers,
                json={
                    "model": model,
                    "messages": messages
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
```

**Completion Criteria**:
- [ ] OpenRouter connection works
- [ ] Can make successful API call
- [ ] Response parsing works

---

### Phase 3.2: Translation Service (25 min)

**Tasks**:
1. Implement medical-aware translation prompt
2. Create translation router endpoint
3. Handle language detection (optional)
4. Add caching for repeated phrases

**Files to Create**:
```
backend/
├── services/
│   └── translation_service.py    # Translation logic
├── routers/
│   └── translate.py              # /api/translate endpoint
└── prompts/
    └── translation.py            # Translation prompts
```

**Translation Prompt Engineering**:
```python
MEDICAL_TRANSLATION_SYSTEM_PROMPT = """You are a professional medical interpreter. 
Translate the following text from {source_lang} to {target_lang}.

IMPORTANT GUIDELINES:
1. Preserve medical terminology accuracy
2. Maintain the original tone and urgency
3. Do not add or remove information
4. If a term has no direct translation, keep it in original language with explanation in parentheses
5. Output ONLY the translation, no explanations or notes

Examples of medical terms to handle carefully:
- Symptoms (dolor, fiebre, náuseas)
- Body parts
- Medication names (keep brand names, translate generic descriptions)
- Medical procedures
"""

async def translate(text: str, source: str, target: str) -> str:
    messages = [
        {"role": "system", "content": MEDICAL_TRANSLATION_SYSTEM_PROMPT.format(
            source_lang=LANGUAGE_NAMES[source],
            target_lang=LANGUAGE_NAMES[target]
        )},
        {"role": "user", "content": text}
    ]
    return await openrouter.chat_completion(messages, model="anthropic/claude-3-haiku")
```

**API Endpoint**:
```python
@router.post("/translate")
async def translate_text(request: TranslateRequest) -> TranslateResponse:
    translated = await translation_service.translate(
        text=request.text,
        source=request.source_language,
        target=request.target_language
    )
    return TranslateResponse(
        original=request.text,
        translated=translated,
        source_language=request.source_language,
        target_language=request.target_language
    )
```

**Completion Criteria**:
- [ ] English → Spanish translation works
- [ ] Spanish → English translation works
- [ ] Medical terms translated accurately
- [ ] Response time < 2 seconds

---

### Phase 3.3: Medical Summary Service (25 min)

**Tasks**:
1. Design structured summary prompt
2. Implement summary extraction logic
3. Parse structured response (JSON)
4. Create summary endpoint

**Files to Create**:
```
backend/
├── services/
│   └── summary_service.py        # Summary generation
├── routers/
│   └── summarize.py              # /api/summarize endpoint
└── prompts/
    └── summary.py                # Summary prompts
```

**Summary Prompt Engineering**:
```python
MEDICAL_SUMMARY_SYSTEM_PROMPT = """You are a medical documentation assistant.
Analyze the following doctor-patient conversation and extract a structured medical summary.

Return a JSON object with the following structure:
{
    "chief_complaint": "Primary reason for visit in one sentence",
    "symptoms": ["List of symptoms mentioned"],
    "duration": "How long symptoms have been present",
    "severity": "mild/moderate/severe based on description",
    "medications_mentioned": ["Any medications discussed"],
    "allergies": ["Any allergies mentioned"],
    "medical_history": ["Relevant past medical history"],
    "vital_signs": ["Any vitals mentioned"],
    "follow_up_actions": ["Recommended next steps"],
    "red_flags": ["Any concerning symptoms requiring urgent attention"],
    "raw_summary": "2-3 sentence narrative summary"
}

If information is not mentioned, use null for that field.
Only extract information explicitly stated in the conversation.
Do not make assumptions or add information not present."""
```

**Summary Service**:
```python
async def generate_summary(conversation_id: str) -> MedicalSummary:
    # 1. Fetch all messages for conversation
    messages = await db.get_messages(conversation_id)
    
    # 2. Format conversation for LLM
    conversation_text = format_conversation(messages)
    
    # 3. Generate summary via OpenRouter
    llm_messages = [
        {"role": "system", "content": MEDICAL_SUMMARY_SYSTEM_PROMPT},
        {"role": "user", "content": f"Conversation:\n{conversation_text}"}
    ]
    
    response = await openrouter.chat_completion(
        llm_messages, 
        model="anthropic/claude-3-sonnet"  # Better model for complex reasoning
    )
    
    # 4. Parse JSON response
    summary = parse_summary_json(response)
    
    # 5. Save to database
    await db.update_conversation_summary(conversation_id, summary)
    
    return summary
```

**Completion Criteria**:
- [ ] Summary generates from conversation
- [ ] JSON structure parses correctly
- [ ] Medical terms properly identified
- [ ] Summary saves to conversation record

---

## 🟣 AGENT 4: Audio & Speech Features

**Owner**: Audio/Integration Agent
**Dependencies**: Frontend setup (Phase 2.1)
**Output Directory**: `/frontend/src/components/audio/`

### Phase 4.1: Audio Recording (25 min)

**Tasks**:
1. Implement MediaRecorder hook
2. Create RecordButton component
3. Build audio visualization (optional)
4. Handle recording states (idle, recording, uploading)

**Files to Create**:
```
frontend/src/
├── hooks/
│   └── useAudioRecorder.ts       # MediaRecorder hook
├── components/audio/
│   ├── RecordButton.tsx          # Main record button
│   ├── AudioPlayer.tsx           # Playback component
│   ├── RecordingIndicator.tsx    # Visual feedback
│   └── AudioWaveform.tsx         # Optional visualization
```

**useAudioRecorder Hook**:
```typescript
interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
}

function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
    duration: 0,
    error: null
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setState(prev => ({ ...prev, audioBlob: blob, audioUrl: url, isRecording: false }));
        chunksRef.current = [];
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true, duration: 0 }));
      
      // Start duration timer
      timerRef.current = window.setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } catch (err) {
      setState(prev => ({ ...prev, error: 'Microphone access denied' }));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
  };

  return { ...state, startRecording, stopRecording };
}
```

**RecordButton Component**:
```tsx
function RecordButton({ onRecordingComplete }: Props) {
  const { isRecording, audioBlob, duration, startRecording, stopRecording } = useAudioRecorder();
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-3 rounded-full transition-all ${
          isRecording 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-nao-green hover:bg-nao-green/90'
        }`}
      >
        {isRecording ? <Square size={20} /> : <Mic size={20} />}
      </button>
      
      {isRecording && (
        <span className="text-sm text-red-500 font-mono">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}
```

**Completion Criteria**:
- [ ] Microphone permission requested
- [ ] Recording starts/stops cleanly
- [ ] Audio blob created successfully
- [ ] Duration displayed during recording

---

### Phase 4.2: Live Speech-to-Text (25 min)

**Tasks**:
1. Implement Web Speech API hook
2. Create speech input component
3. Handle interim vs final results
4. Support English and Spanish recognition

**Files to Create**:
```
frontend/src/
├── hooks/
│   └── useSpeechRecognition.ts   # Web Speech API hook
├── components/audio/
│   └── SpeechInput.tsx           # Speech-to-text input
```

**useSpeechRecognition Hook**:
```typescript
interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

function useSpeechRecognition(language: 'en-US' | 'es-ES' = 'en-US') {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!state.isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      
      setState(prev => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim
      }));
    };

    recognition.onerror = (event) => {
      setState(prev => ({ ...prev, error: event.error, isListening: false }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;
  }, [language, state.isSupported]);

  const startListening = () => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '', error: null }));
    recognitionRef.current?.start();
    setState(prev => ({ ...prev, isListening: true }));
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const resetTranscript = () => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  };

  return { ...state, startListening, stopListening, resetTranscript };
}
```

**SpeechInput Component**:
```tsx
function SpeechInput({ onTranscriptReady, language }: Props) {
  const { 
    isListening, 
    transcript, 
    interimTranscript, 
    isSupported,
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition(language);

  if (!isSupported) {
    return (
      <div className="text-amber-600 text-sm">
        Speech recognition not supported in this browser
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-nao-navy text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={18} /> Stop
            </>
          ) : (
            <>
              <Mic size={18} /> Speak
            </>
          )}
        </button>
        
        {isListening && (
          <span className="text-red-500 animate-pulse">● Listening...</span>
        )}
      </div>
      
      {(transcript || interimTranscript) && (
        <div className="p-3 bg-gray-100 rounded-lg">
          <span className="text-nao-navy">{transcript}</span>
          <span className="text-gray-400 italic">{interimTranscript}</span>
        </div>
      )}
    </div>
  );
}
```

**Completion Criteria**:
- [ ] Speech recognition starts on button click
- [ ] Live transcript appears as user speaks
- [ ] Supports both English and Spanish
- [ ] Graceful fallback if not supported

---

### Phase 4.3: Integration & Polish (10 min)

**Tasks**:
1. Connect audio recording to message flow
2. Integrate speech-to-text with message input
3. Add audio upload to backend
4. Test end-to-end audio flow

**Integration Points**:
```tsx
// In MessageInput.tsx
function MessageInput({ conversationId, role, language }) {
  const [inputText, setInputText] = useState('');
  const { sendMessage } = useWebSocket(conversationId);
  const { audioBlob, startRecording, stopRecording } = useAudioRecorder();
  const { transcript, startListening, stopListening } = useSpeechRecognition(language);

  // When speech-to-text completes, populate input
  useEffect(() => {
    if (transcript) {
      setInputText(prev => prev + transcript);
    }
  }, [transcript]);

  // When recording completes, upload and send as audio message
  useEffect(() => {
    if (audioBlob) {
      uploadAudioAndSend(audioBlob);
    }
  }, [audioBlob]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText, role);
    setInputText('');
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t">
      <RecordButton onComplete={setAudioBlob} />
      <SpeechInput language={language} onTranscript={setInputText} />
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        className="flex-1 px-4 py-2 border rounded-lg"
        placeholder="Type or speak your message..."
      />
      <button onClick={handleSend} className="p-2 bg-nao-green rounded-lg">
        <Send size={20} />
      </button>
    </div>
  );
}
```

**Completion Criteria**:
- [ ] Audio messages appear in chat with player
- [ ] Speech input populates text field
- [ ] Full flow works: speak → transcribe → translate → display

---

## 🔴 FINAL PHASE: Deployment & Documentation

**Owner**: All agents collaborate
**Timeline**: Final 20 minutes

### Deployment Checklist

**Backend (Railway)**:
```bash
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"

# Set environment variables in Railway dashboard:
# - OPENROUTER_API_KEY
# - ALLOWED_ORIGINS
```

**Frontend (Vercel)**:
```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_WS_URL": "@ws_url"
  }
}
```

### README.md Template

```markdown
# 🏥 MedTranslate - Healthcare Translation Bridge

Real-time doctor-patient communication across language barriers.

## 🎯 Features

### ✅ Completed
- [x] Real-time translation (English ↔ Spanish)
- [x] WebSocket-based live messaging
- [x] Audio recording & playback
- [x] Live speech-to-text (Web Speech API)
- [x] Conversation persistence (SQLite)
- [x] AI-powered medical summaries
- [x] Mobile-responsive UI

### 🚧 Known Limitations
- Search highlighting partially implemented
- No user authentication (session-based only)
- Audio transcription uses browser API (not Whisper)

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python FastAPI |
| Database | SQLite |
| AI/LLM | OpenRouter (Claude 3 Haiku/Sonnet) |
| Speech | Web Speech API (browser-native) |
| Real-time | WebSockets |
| Deployment | Vercel (frontend) + Railway (backend) |

## 🚀 Live Demo

- **Frontend**: https://medtranslate.vercel.app
- **Backend API**: https://medtranslate-api.railway.app

## 📦 Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- OpenRouter API key

### Backend Setup
\```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
uvicorn main:app --reload
\```

### Frontend Setup
\```bash
cd frontend
npm install
cp .env.example .env.local
# Update API URLs in .env.local
npm run dev
\```

## 🤖 AI Tools Used

This project was built with assistance from:
- **Claude (Anthropic)**: Architecture design, code generation, debugging
- **OpenRouter API**: Translation and summarization via Claude 3 Haiku/Sonnet

## 📝 Design Decisions

1. **Web Speech API over Whisper**: Chose browser-native speech recognition for zero-latency, zero-cost real-time transcription. Tradeoff: Less accurate than Whisper, browser-dependent.

2. **SQLite over Postgres**: For a demo application, SQLite provides zero-configuration persistence. Would migrate to Postgres for production.

3. **WebSockets for real-time**: Enables instant message delivery between Doctor and Patient views without polling.

## 📄 License

MIT - Built for Nao Medical Software Engineering Intern Assessment
```

---

## 📊 Progress Tracking

Use this checklist to track completion:

```
AGENT 1 - Backend Core
├── [ ] Phase 1.1: Project Setup
├── [ ] Phase 1.2: REST API Endpoints  
└── [ ] Phase 1.3: WebSocket Implementation

AGENT 2 - Frontend Core
├── [ ] Phase 2.1: Project Setup
├── [ ] Phase 2.2: Chat Interface Components
└── [ ] Phase 2.3: State Management & API Integration

AGENT 3 - AI Services
├── [ ] Phase 3.1: OpenRouter Setup
├── [ ] Phase 3.2: Translation Service
└── [ ] Phase 3.3: Medical Summary Service

AGENT 4 - Audio & Speech
├── [ ] Phase 4.1: Audio Recording
├── [ ] Phase 4.2: Live Speech-to-Text
└── [ ] Phase 4.3: Integration & Polish

FINAL
├── [ ] Backend deployed to Railway
├── [ ] Frontend deployed to Vercel
├── [ ] README.md complete
└── [ ] GitHub repository public
```

---

*Last Updated: February 4, 2026*
