# 🎤 Flash Interviewer AI - AI-Powered Interview Practice Platform

A cutting-edge, full-stack interview practice application built with Next.js and AI technology that helps users master job interviews through realistic AI-powered voice simulations with comprehensive feedback and progress tracking.

![Flash Interviewer AI](https://img.shields.io/badge/Flash%20Interviewer-AI%20Powered-blue?style=for-the-badge&logo=robot)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

🚀 Features


✨ Core Functionality

🎤 AI Voice Interviews – Real-time voice conversations with AI interviewers

🛠️ Custom Interview Generation – Personalized by role, level, and tech stack

📊 Comprehensive Feedback – Detailed scoring across multiple categories

📈 Progress Tracking – Monitor interview performance over time

👤 User Authentication – Secure login/signup with Firebase Auth

🖼️ Profile Management – Profile editing & interview history

📱 Responsive Design – Works seamlessly across all devices



🎨 Visual Features

🖌️ Modern UI – Clean, intuitive interface with Tailwind CSS

🏢 Company Branding – Covers with popular company logos

⚙️ Tech Stack Icons – Visual representation of technologies

📋 Interview Cards – Beautiful display of past interview sessions

🌙 Dark/Light Mode – Theme support with Next Themes

🔔 Toast Notifications – Friendly user feedback with Sonner



🤖 AI Features

🎙️ Voice Recognition – Real-time speech-to-text with Deepgram

🗣️ AI Voice Synthesis – Natural-sounding voices with 11Labs

🧠 GPT-4 Integration – Smart, context-aware interview conversations

📝 Automatic Feedback – AI-generated interview assessments

🔄 Real-time Processing – Instant response for seamless conversation



🛠️ Technical Features

🔐 Firebase Authentication – Secure user accounts

🗄️ Firestore Database – Real-time NoSQL data sync

🎯 VAPI AI SDK – Voice AI integration

📱 PWA Ready – Installable on desktop & mobile

⚡ Turbopack – Lightning-fast builds

🔍 TypeScript – Full type safety



🛠️ Tech Stack
Frontend

⚛️ Next.js 15.4.6 – Full-stack React framework

⚛️ React 18.3.1 – Modern UI library

🎨 Tailwind CSS 4.0 – Utility-first CSS

📘 TypeScript 5.0 – Type-safe development

🎭 shadcn/ui – Beautiful, accessible components

🎨 Radix UI – Accessible primitives

🔗 Lucide React – Icon set

🌙 Next Themes – Dark/light mode

🔔 Sonner – Toast notifications

📝 React Hook Form – Form management

✅ Zod – Schema validation

📅 Day.js – Date manipulation



AI & Voice

🤖 VAPI AI SDK – Voice AI integration

🎙️ Deepgram – Speech-to-text

🗣️ 11Labs – Voice synthesis

🧠 OpenAI GPT-4 – AI-powered interviewer

🔧 AI SDK – AI utilities



Backend & Database

🔥 Firebase – Backend-as-a-Service

🔐 Firebase Auth – Authentication

🗄️ Firebase Firestore – NoSQL DB

👨‍💻 Firebase Admin – Server SDK



Development Tools

🔍 ESLint – Linting

⚡ Turbopack – Fast bundler

📦 npm – Package manager

🎯 TypeScript – Type checking

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project setup
- VAPI AI account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/flash-interviewer-ai.git
cd flash-interviewer-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create `.env.local` file in the root directory:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_firebase_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_firebase_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_firebase_client_email

# VAPI AI
VAPI_API_KEY=your_vapi_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

4. **Start the development server**
```bash
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000

## 📱 Key Components

### AI & Voice Components
- **Agent** - Main AI interviewer component with voice integration
- **InterviewCard** - Display component for interview sessions
- **DisplayTechIcons** - Visual tech stack representation

### Authentication Components
- **AuthForm** - Sign-in/sign-up form component
- **FormField** - Reusable form input component

### UI Components
- **shadcn/ui** - Beautiful, accessible component library
- **Button** - Custom button component with variants
- **Input** - Styled input component
- **Label** - Accessible label component
- **Form** - Form components with validation
- **Sonner** - Toast notification system

## �� Security Features
- **Firebase Authentication** - Secure user authentication
- **Environment Variables** - Secure API key management
- **TypeScript** - Type safety and error prevention
- **Input Validation** - Zod schema validation
- **CORS Protection** - Cross-origin request handling

## �� Responsive Design
The application is fully responsive and works seamlessly on:
- 📱 Mobile devices
- 📱 Tablets
- �� Desktop computers
- ��️ Large screens

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## �� API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Interview Management
- `GET /api/interviews` - Get user's interviews
- `POST /api/interviews` - Create new interview
- `GET /api/interviews/[id]` - Get specific interview
- `PUT /api/interviews/[id]` - Update interview

### Feedback System
- `POST /api/feedback` - Generate AI feedback
- `GET /api/feedback/[id]` - Get feedback details

### AI Integration
- `POST /api/vapi/generate` - Generate interview questions

## 🎨 Key Features Explained

### AI Voice Interviews
- Real-time voice conversation with AI interviewer
- Natural language processing for contextual responses
- Professional interview simulation with structured questions

### Custom Interview Generation
- Role-based interview customization (Frontend, Backend, Full Stack)
- Experience level targeting (Junior, Mid, Senior)
- Tech stack-specific questions and scenarios

### Comprehensive Feedback System
- **Communication Skills** - Clarity, articulation, and engagement
- **Technical Knowledge** - Subject matter expertise
- **Problem Solving** - Analytical thinking and solution approach
- **Cultural Fit** - Team compatibility and values alignment
- **Confidence and Clarity** - Self-assurance and presentation

### Progress Tracking
- Interview history and performance metrics
- Score trends and improvement areas
- Personalized recommendations for growth

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments
- [VAPI AI](https://vapi.ai) for voice AI capabilities
- [OpenAI](https://openai.com) for GPT-4 integration
- [Firebase](https://firebase.google.com) for backend services
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the beautiful styling
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library

---

**Ready to ace your next interview? Start practicing with Flash Interviewer AI today! 🚀**
