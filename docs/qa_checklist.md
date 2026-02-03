# MedTranslate QA Checklist

## P0 Features (Must Ship)

### Two-Role Interface
- [ ] Doctor role selectable
- [ ] Patient role selectable
- [ ] Role toggle works correctly
- [ ] UI updates based on selected role

### Real-Time Text Translation
- [ ] Send message as Doctor (English)
- [ ] See Spanish translation appear
- [ ] Send message as Patient (Spanish)
- [ ] See English translation appear
- [ ] Both original and translated text displayed

### Conversation Persistence
- [ ] Create new conversation
- [ ] Send messages
- [ ] Refresh page - messages persist
- [ ] Multiple conversations show in sidebar

### AI-Generated Medical Summary
- [ ] Click Summary button
- [ ] Summary modal appears
- [ ] Chief complaint populated
- [ ] Symptoms listed
- [ ] Medications listed (if discussed)
- [ ] Allergies listed (if discussed)
- [ ] Follow-up recommendations present
- [ ] Regenerate button works

### Public URL / Deployment Ready
- [ ] Backend can run locally
- [ ] Frontend can run locally
- [ ] Dockerfile present for Railway
- [ ] vercel.json present for Vercel
- [ ] Environment variables documented

### README with Setup Instructions
- [ ] Quick start for backend
- [ ] Quick start for frontend
- [ ] API endpoints documented
- [ ] Environment variables listed
- [ ] Demo script included

---

## P1-P2 Features (Strong Submission)

### Audio Recording in Browser
- [ ] Record button visible
- [ ] Microphone permission requested
- [ ] Recording starts
- [ ] Recording stops
- [ ] Audio blob created

### Audio Playback in Chat
- [ ] Audio player appears for audio messages
- [ ] Play button works
- [ ] Pause button works
- [ ] Progress bar updates
- [ ] Time display accurate

### Live Speech-to-Text
- [ ] Speech input component visible
- [ ] Microphone button works
- [ ] Transcript appears as user speaks
- [ ] Interim results shown
- [ ] Final transcript captured

### Mobile-Responsive Design
- [ ] Layout works on mobile (375px)
- [ ] Sidebar collapses on mobile
- [ ] Touch targets large enough
- [ ] Text is readable

### Conversation History List
- [ ] Conversations appear in sidebar
- [ ] Most recent at top
- [ ] Click to navigate to conversation
- [ ] Active conversation highlighted
- [ ] Status shown (active/completed)

---

## P3 Features (Impressive)

### Conversation Search with Highlighting
- [ ] Search bar in sidebar
- [ ] Type query
- [ ] Results filtered
- [ ] Matching text highlighted
- [ ] Click result to navigate

### Typing Indicators
- [ ] Typing indicator appears
- [ ] Shows correct role
- [ ] Disappears after timeout
- [ ] Animated dots

### Multiple Language Pairs
- [ ] Can select different doctor language
- [ ] Can select different patient language
- [ ] Translation uses correct pair
- [ ] Settings persist per conversation

---

## Backend Health Checks

### Health Endpoint
```bash
curl http://localhost:8000/health
# Expected: {"status": "ok", "version": "1.0.0"}
```

### Translation Endpoint
```bash
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello doctor", "source_language": "en", "target_language": "es"}'
# Expected: Spanish translation
```

### Create Conversation
```bash
curl -X POST http://localhost:8000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"doctor_language": "en", "patient_language": "es"}'
# Expected: Conversation object with ID
```

---

## Frontend Smoke Tests

### Page Loads
- [ ] HomePage loads at /
- [ ] ChatPage loads at /chat/:id
- [ ] No console errors
- [ ] Styles applied correctly

### User Flow
1. Navigate to home page
2. Click "Start New Conversation"
3. Select Doctor role
4. Type "Hello, I need help"
5. Click Send
6. See translation appear
7. Select Patient role
8. Type "Hola, gracias"
9. Click Send
10. See translation appear
11. Click Summary button
12. See generated summary

---

## WebSocket Tests

### Connection
- [ ] WebSocket connects to `/ws/{id}`
- [ ] No errors on connection
- [ ] Disconnects cleanly

### Message Broadcasting
- [ ] Open two browser tabs
- [ ] Send message in tab A
- [ ] Message appears in tab B
- [ ] Translation applied

---

## Known Issues

<!-- Document any issues found during testing -->

---

## Sign-off

Tester: _________________ Date: _________

Notes:
