# CodeSupport - Client

A modern React-based frontend application for managing custom software development projects. CodeSupport connects businesses with developers through an integrated platform for quotes, orders, contracts, invoicing, and real-time collaboration.

## Features

### For Customers
- 🌐 **Service Browsing**: Explore web development, mobile apps, backend systems, and more
- 💰 **Pricing & Quotes**: View service pricing and request custom quotes
- 📋 **Order Management**: Create and track development orders
- 📄 **Contract Management**: Review and sign digital contracts
- 💳 **Payment Tracking**: Monitor order payments and invoicing
- 📱 **Real-time Notifications**: Get instant updates on project progress
- 💬 **Direct Messaging**: Communicate with assigned developers
- 📊 **Dashboard**: Personal workspace for managing all projects

### For Developers
- 📝 **Task Management**: View and manage assigned development tasks
- 📋 **Quote Creation**: Generate custom project quotes
- 📄 **Contract Handling**: Create and manage development contracts
- 🏢 **Team Workspace**: Collaborate with team members
- 📊 **Performance Analytics**: Track work and project metrics
- ✍️ **Digital Signatures**: Sign contracts and documents

### For Admins
- 👥 **User Management**: Manage customers and developers
- 📊 **Analytics Dashboard**: Monitor platform activity and metrics
- 💰 **Payment Management**: Track orders, payments, and invoicing
- ⚙️ **Settings & Configuration**: Platform-wide settings
- 🔔 **Notification System**: Send notifications to users
- 📈 **Reports**: Generate business intelligence reports

## Tech Stack

- **Framework**: React 19
- **Bundler**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **State Management**: Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **UI Components**: React Icons
- **PDF Generation**: jsPDF
- **Charts**: Recharts
- **Signature Pad**: Signature Pad
- **Linting**: ESLint

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── auth/           # Authentication components
│   ├── cards/          # Card-based UI components
│   ├── common/         # Common shared components
│   ├── dashboard/      # Dashboard-specific components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   ├── sections/       # Page section components
│   └── ui/             # UI utility components
├── context/            # React Context for state management
├── data/               # Static data and configurations
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
├── styles/             # Global styles
├── utils/              # Utility functions
├── App.jsx             # Main App component
└── main.jsx            # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the required environment variables:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Linting

Run ESLint to check for code issues:
```bash
npm run lint
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API server URL |
| `VITE_SOCKET_URL` | WebSocket server URL |

## Key Components

### Authentication
- OAuth login/callback handling
- Protected route management
- JWT token management

### Dashboard
- Customer order management
- Developer task dashboard
- Admin analytics overview
- Real-time notifications

### Forms
- Quote request forms
- Order creation forms
- Contract management forms
- User profile forms

### Real-time Features
- Socket.io integration for instant updates
- Real-time messaging
- Live notifications
- Deadline countdown tracking

## API Integration

The client communicates with the backend API for:
- User authentication and authorization
- Order and quote management
- Payment processing
- Contract management
- Real-time messaging via Socket.io

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

ISC
