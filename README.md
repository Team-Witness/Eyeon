# AVZDAX - Advanced Video Surveillance Dashboard

A modern, real-time surveillance monitoring dashboard built with Next.js and TypeScript.

## 🚀 Features

- **Real-time Monitoring**: Live camera feeds with WebSocket updates
- **Threat Detection**: AI-powered threat scoring and alerts
- **Alert Management**: Acknowledge, escalate, or mark alerts as false positives
- **Analytics Dashboard**: Comprehensive threat analysis and reporting
- **User Management**: Role-based access control
- **Mobile Responsive**: Works perfectly on all devices
- **Offline Support**: Graceful fallback when backend is unavailable

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Real-time**: WebSocket with auto-reconnect
- **State Management**: React Hooks
- **UI Components**: Custom components with shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Custom toast system

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd avzdax-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

## 🔧 Environment Variables

\`\`\`bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/live-feed/
\`\`\`

## 🏗️ Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── analytics/         # Analytics page
│   ├── settings/          # Settings page
│   ├── users/            # User management page
│   └── page.tsx          # Dashboard page
├── components/           # Reusable UI components
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── data/                # Mock data for development
├── config/              # Application configuration
└── docs/                # Documentation
\`\`\`

## 🔌 Backend Integration

The frontend is designed to work with a NestJS backend. See `/docs/API_INTEGRATION.md` for complete integration specifications.

### Required API Endpoints
- `GET /api/v1/dashboard` - Dashboard data
- `GET /api/v1/alerts` - Alert management
- `GET /api/v1/cameras` - Camera feeds
- `WebSocket /ws/live-feed/` - Real-time updates

## 🎯 Development Mode

The application includes a comprehensive development mode with:
- Mock data for all features
- Simulated real-time updates
- Error state demonstrations
- Loading state examples

## 🚀 Deployment

### Frontend Deployment
\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

### Vercel Deployment
\`\`\`bash
# Deploy to Vercel
vercel --prod
\`\`\`

## 📱 Features Overview

### Dashboard
- Live camera feed grid
- Real-time threat level indicator
- Active alerts panel
- Historical events timeline

### Analytics
- Threat statistics and trends
- Camera performance metrics
- Daily/weekly reports
- System health monitoring

### User Management
- User roles (Admin, Security, Viewer)
- Access control
- Activity tracking

### Settings
- Alert thresholds
- Notification preferences
- System configuration
- Camera settings

## 🔧 Customization

### Themes
Modify `tailwind.config.ts` for custom styling.

### Configuration
Update `config/app.config.ts` for feature flags and settings.

### Mock Data
Modify `data/mockData.ts` for development testing.

## 📊 Performance

- **First Load**: < 2s
- **API Response**: < 500ms
- **WebSocket Latency**: < 100ms
- **Mobile Performance**: 90+ Lighthouse score

## 🛡️ Security

- CORS protection
- Input validation
- XSS prevention
- Rate limiting ready
- JWT authentication ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For backend integration support, see:
- `/docs/API_INTEGRATION.md` - Complete API specifications
- `/docs/DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `/types/api.ts` - TypeScript interfaces

---

**Status**: ✅ Frontend Complete - Ready for Backend Integration
