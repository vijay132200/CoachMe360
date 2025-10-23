# CoachMe360 - Leadership Development Platform

## Project Overview
CoachMe360 is a comprehensive web application that helps managers discover blind spots through 360° feedback, build emotional intelligence, practice feedback delivery, track progress with data visualization, run team pulse checks, and practice leadership via AI-driven simulations using Gemini API.

## Core Features

### 1. Dashboard
- Interactive radar chart comparing self-assessment vs 360° feedback
- Trend lines showing progress over time
- Team pulse snapshot with key metrics
- Quick stats cards for assessments, feedback, pulse, and growth

### 2. Self-Assessment
- Likert scale (1-10) rating form for leadership competencies
- Manager selection
- Configurable competency list
- Reset and submit functionality

### 3. 360° Feedback
- Anonymous feedback submission (multiple consecutive submissions)
- Rating + qualitative comments for each competency
- Privacy-first design with clear anonymity indicators
- Optional named feedback
- Submission counter

### 4. Reports
- AI-powered gap analysis using Gemini
- Strengths and development areas identification
- Key themes from feedback
- Action recommendations grounded in HR theory (GROW, SBI, Path-Goal, Johari Window)
- PDF export functionality

### 5. Pulse Check (PulseEngage)
- Weekly team check-in (3 questions: listened-to, workload fairness, manager helpfulness)
- Anonymous aggregation
- Historical trend visualization with line charts
- Individual score tracking

### 6. Reflection Journal (EQ Mirror)
- Daily/weekly journaling with AI-powered prompts
- Gemini sentiment analysis
- Emotional tone tracking
- Journal history with sentiment scores and emotion tags

### 7. Feedback Buddy (Role-play)
- AI-driven role-play chat interface
- Practice delivering feedback with Gemini playing direct report
- SBI (Situation-Behavior-Impact) score evaluation
- Tone and approach scoring
- Real-time AI evaluation and suggestions

### 8. GROW Goals
- Structured coaching framework (Goal, Reality, Options, Will)
- Direct report management
- Progress notes tracking
- Status management (active, completed, paused)

### 9. LeadLab Simulations
- Gamified leadership scenarios
- Choice-based decision making
- Team morale and performance impact
- Theory-grounded feedback (Path-Goal, Transformational Leadership)
- Simulation history tracking

### 10. Admin Dashboard
- Manager creation and management
- Competency configuration
- System statistics (managers, assessments, feedback, competencies)
- Data export (CSV) for managers, assessments, feedback, pulse checks

## Technical Stack

### Frontend
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching
- React Hook Form + Zod for form validation
- Shadcn UI component library
- Tailwind CSS for styling
- Recharts for data visualization
- Dark mode support

### Backend
- Express.js
- In-memory storage (MemStorage)
- Gemini AI integration for all NLP/ML tasks

### AI Features (Gemini API)
- 360° feedback gap analysis
- Sentiment analysis for journal entries
- Role-play simulation and evaluation
- Coaching action suggestions
- Theme extraction from feedback

## Data Model

### Core Entities
- **Managers**: id, name, department, role
- **Competencies**: id, name, description, order
- **Self Assessments**: id, managerId, responses (JSON), createdAt
- **Feedbacks**: id, managerId, responses (JSON), comments (JSON), isAnonymous, submitterName
- **Pulse Checks**: id, managerId, listenedTo, workloadFair, managerHelpful
- **Journal Entries**: id, managerId, text, sentimentScore, emotionTags
- **GROW Goals**: id, managerId, directReport, goal, reality, options, will, progressNotes, status
- **AI Analyses**: id, managerId, sourceType, summary, themes, strengths, developmentAreas, actionItems
- **Simulations**: id, managerId, scenarioId, choices, teamMoraleScore, performanceScore, feedback
- **Roleplay Sessions**: id, managerId, messages, evaluation, sbiScore, toneScore

## Design System

### Colors
- Primary: Professional blue (220° hue)
- Chart colors: Blue (self), Purple (360), Green (pulse trends)
- Semantic: Success (green), Warning (orange), Error (red), Info (blue)

### Typography
- Font: Inter (sans), JetBrains Mono (mono)
- Scales: Display, H1-H3, Body, Caption, Overline
- Weights: 400 (regular), 500 (medium), 600 (semibold)

### Layout
- Sidebar navigation (16rem width)
- Responsive design (mobile-first)
- Card-based content organization
- Consistent spacing and padding

## User Flow

1. **No Sign-in Required**: Users access features directly
2. **Manager Selection**: Choose manager for assessments/feedback
3. **Feedback Collection**: Multiple anonymous submissions on single page
4. **AI Analysis**: Gemini processes feedback and generates insights
5. **Action Planning**: GROW goals and simulations for skill development
6. **Progress Tracking**: Dashboard visualizations and trend analysis

## Privacy & Security
- Anonymous feedback by default
- No user accounts required
- Data stored securely in memory (development)
- HTTPS recommended for production

## Development Status

### Phase 1: Schema & Frontend ✅
- All data schemas defined
- Design tokens configured
- All React components built
- Exceptional visual quality achieved
- Full navigation with sidebar
- Dark mode support

### Phase 2: Backend (In Progress)
- API endpoints implementation
- Gemini AI integration
- Storage interface
- Validation and error handling

### Phase 3: Integration & Testing (Pending)
- Connect frontend to backend
- Loading and error states
- E2E testing
- Architect review

## Environment Variables
- `GEMINI_API_KEY`: Required for all AI features
- `SESSION_SECRET`: For session management

## Deployment Notes
- Bind frontend to 0.0.0.0:5000
- Use workflow "Start application" (npm run dev)
- Auto-restart on package installation

## Future Enhancements
- Derailment risk prediction
- Meeting transcript analysis
- Slack integration
- Audio transcription
- Predictive analytics dashboard
- Badging system for leadership improvement
