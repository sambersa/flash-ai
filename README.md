# 🎤 Flash Interviewer AI - AI-Powered Interview Practice Platform

A cutting-edge, full-stack interview practice application built with Next.js and AI technology that helps users master job interviews through realistic AI-powered voice simulations with comprehensive feedback and progress tracking.

![Flash Interviewer AI](https://img.shields.io/badge/Flash%20Interviewer-AI%20Powered-blue?style=for-the-badge&logo=robot)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🚀 Features  

### ✨ Core Functionality  
- 🎤 **AI Voice Interviews** - Real-time voice conversations with AI interviewers  
- 🛠️ **Custom Interview Generation** - Personalized interviews based on role, level, and tech stack  
- 📊 **Comprehensive Feedback** - Detailed scoring across multiple categories  
- 📈 **Progress Tracking** - Monitor your interview performance over time  
- 👤 **User Authentication** - Secure login/signup with Firebase Auth  
- 🖼️ **Profile Management** - User profile and interview history  
- 📱 **Responsive Design** - Works seamlessly on all devices  

### 🎨 Visual Features  
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS  
- 🏢 **Company Branding** - Interview covers with popular company logos  
- 🖥️ **Tech Stack Icons** - Visual representation of technologies  
- 📊 **Interview Cards** - Beautiful display of interview sessions  
- 🌙 **Dark/Light Mode** - Theme support with next-themes  
- 🔔 **Toast Notifications** - User-friendly feedback with Sonner  

### 🤖 AI Features  
- 🎙️ **Voice Recognition** - Real-time speech-to-text with Deepgram  
- 🗣️ **AI Voice Synthesis** - Natural-sounding interviewer with 11Labs  
- 🧠 **GPT-4 Integration** - Advanced AI for intelligent conversations  
- 📝 **Automatic Feedback** - AI-generated comprehensive assessments  
- 🔄 **Real-time Processing** - Instant voice interaction and response  

### 🛠️ Technical Features  
- 🔐 **Firebase Authentication** - Secure user management  
- 🗄️ **Firebase Database** - Real-time data synchronization  
- 🎯 **VAPI AI SDK** - Voice AI integration  
- 📱 **PWA Ready** - Progressive Web App capabilities  
- ⚡ **Turbopack** - Fast development and build times  
- 🔍 **TypeScript** - Type-safe development experience  

---

## 🛠️ Tech Stack  

### Frontend  
- ⚛️ Next.js 15.4.6 - Full-stack React framework  
- ⚛️ React 18.3.1 - Modern UI library  
- 🎨 Tailwind CSS 4.0 - Utility-first CSS framework  
- 🔍 TypeScript 5.0 - Type-safe JavaScript  
- 🎭 shadcn/ui - Beautiful, accessible component library  
- 🎨 Radix UI - Accessible component primitives  
- 🌙 Next Themes - Dark/light mode support  
- 🔔 Sonner - Toast notifications  
- 📝 React Hook Form - Form management  
- ✅ Zod - Schema validation  
- 📅 Day.js - Date manipulation  

### AI & Voice  
- 🤖 VAPI AI SDK - Voice AI platform integration  
- 🎙️ Deepgram - Speech-to-text transcription  
- 🗣️ 11Labs - AI voice synthesis  
- 🧠 OpenAI GPT-4 - Advanced language model  

### Backend & Database  
- 🔥 Firebase - Backend-as-a-Service  
- 🔐 Firebase Auth - User authentication  
- 🗄️ Firebase Firestore - NoSQL database  
- 👨‍💻 Firebase Admin - Server-side Firebase SDK  

### Development Tools  
- 🔍 ESLint - Code linting  
- ⚡ Turbopack - Fast bundler  
- 📦 npm - Package management  
- 🎯 TypeScript - Type checking  

---

## 📸 Screenshots  

### 🔐 Authentication  
<p align="center">
  <img src="https://github.com/user-attachments/assets/961722da-2ace-4a32-beb2-cc80e378aa41" width="45%" />
  <img src="https://github.com/user-attachments/assets/3fddc7af-3195-4455-9374-be18fa724590" width="45%" />
</p>

### 🎤 AI Interview  
![Interview Session](https://i.gyazo.com/bc725676a42913bc9a84d6e3464a982a.jpg)

---

Flash Interviewer AI
This is a solid AI interview prep tool with voice, feedback, and tracking to level up your tech game.
🚀 Get Started
What You Need

Node.js (v18+)
npm or Yarn
Firebase project for auth and backend
VAPI AI account for voice
OpenAI API key for questions and feedback

Installation


Clone the repo: git clone https://github.com/yourusername/flash-interviewer-ai.git


Move in: cd flash-interviewer-ai


Install dependencies: npm install


Set up .env.local in the root with:
Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_firebase_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_firebase_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_firebase_client_email
VAPI AI
VAPI_API_KEY=your_vapi_api_key
OpenAI
OPENAI_API_KEY=your_openai_api_key


Start the dev server: npm run dev


Check it: http://localhost:3000


📱 Key Components
AI & Voice

Agent: AI interviewer with voice
InterviewCard: Shows interview sessions with small round tech stack icons
DisplayTechIcons: Displays tech stacks visually

Auth Components

AuthForm: Sign-in/sign-up form
FormField: Reusable input

UI Components

shadcn/ui: Accessible components
Button: Custom buttons
Input: Styled inputs
Label: Accessible labels
Form: Forms with validation
Sonner: Toast notifications

🔒 Security

Firebase Auth: Secure user login
Env Vars: Protected API keys
TypeScript: Type safety
Zod Validation: Input checks
CORS Protection: Blocks shady requests

📱 Responsive
Works on:

Phones
Tablets
Desktops
Large screens

🚀 Deployment
Vercel

Push to GitHub
Link to Vercel
Add env vars in Vercel
Deploy

Manual
Build
npm run build
Run
npm start
🔌 API Endpoints
Auth

POST /api/auth/signup: New user
POST /api/auth/signin: Log in

Interview Management

GET /api/interviews: List interviews
POST /api/interviews: Start new
GET /api/interviews/[id]: View specific
PUT /api/interviews/[id]: Update

Feedback System

POST /api/feedback: AI feedback
GET /api/feedback/[id]: Feedback details

AI Integration

POST /api/vapi/generate: Generate questions

🎨 Key Features
AI Voice Interviews

Real-time voice with AI
Natural convo
Pro interview sim

Custom Interview Generation

Role-based (Frontend, Backend, Full Stack)
Level targeting (Junior, Mid, Senior)
Tech-specific questions

Comprehensive Feedback

Communication Skills: Clarity and engagement
Technical Knowledge: Expertise
Problem Solving: Analytical thinking
Cultural Fit: Team compatibility
Confidence: Presentation

Progress Tracking

Interview history
Score trends
Growth tips

🤝 Contributing

Fork the repo
Create branch: git checkout -b feature/AmazingFeature
Commit: git commit -m 'Add AmazingFeature'
Push: git push origin feature/AmazingFeature
Open PR

🙏 Shoutouts

VAPI AI: Voice tech
OpenAI: GPT-4
Firebase: Backend
Next.js: Framework
Tailwind CSS: Styling
shadcn/ui: Components

Ready to crush your next interview? Dive into Flash Interviewer AI!
