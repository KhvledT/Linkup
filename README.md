# Linkup - Social Media Application

## 🚀 Project Overview

**Linkup** is a modern, feature-rich social media application built with React that provides users with a comprehensive platform for social networking. The application features a beautiful, warm design with dynamic theming capabilities and a robust set of social media features.

## ✨ Key Features

### 🔐 User Authentication & Management
- **User Registration**: Complete user registration with comprehensive validation
- **Secure Login**: Token-based authentication system
- **Profile Management**: User profile creation, editing, and image uploads
- **Protected Routes**: Secure access control for authenticated users

### 📱 Social Media Core Features
- **Post Creation**: Create, edit, and delete posts with text and images
- **Feed System**: Infinite scroll feed displaying all user posts
- **Comment System**: Add, edit, and delete comments on posts
- **User Profiles**: View and manage user profiles and posts
- **Post Interactions**: Like, comment, and share posts

### 🎨 Advanced UI/UX Features
- **Dynamic Theme System**: 5 pre-built color schemes with real-time switching
- **Dark/Light Mode**: Automatic theme switching with localStorage persistence
- **Glass Morphism**: Modern backdrop blur effects and visual elements
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Decorative Elements**: Floating shapes and geometric patterns for visual appeal

### 🌈 Available Color Themes
1. **Dark Red** (Default) - Warm, passionate theme
2. **Deep Purple** - Elegant, sophisticated theme  
3. **Ocean Blue** - Calm, professional theme
4. **Forest Green** - Natural, organic theme
5. **Sunset Orange** - Energetic, vibrant theme

## 🏗️ Technical Architecture

### Frontend Framework
- **React 19.1.0** - Latest React with modern features
- **Vite 7.0.4** - Fast build tool and development server
- **React Router DOM 7.7.1** - Client-side routing with protected routes

### State Management
- **React Context API** - Global state management for authentication and theming
- **TanStack React Query 5.85.3** - Server state management with caching
- **React Hook Form 7.62.0** - Efficient form state management

### UI Components & Styling
- **HeroUI React 2.8.2** - Modern, accessible UI component library
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Framer Motion 12.23.12** - Animation library for smooth transitions
- **FontAwesome 7.0.0** - Comprehensive icon library

### Data Validation & API
- **Zod 4.0.14** - Type-safe schema validation
- **Axios 1.11.0** - HTTP client for API communication
- **Form Validation**: Comprehensive validation for registration and login forms

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Post.jsx        # Individual post display component
│   ├── CreatePost.jsx  # Post creation interface
│   ├── Comments.jsx    # Comment display and management
│   ├── Navbar.jsx      # Navigation component
│   ├── Sidebar.jsx     # Side navigation panel
│   └── ...             # Other UI components
├── Contexts/           # React Context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── ThemeContext.jsx # Theme and color management
├── Layout/             # Layout wrapper components
│   ├── AuthLayout.jsx  # Authentication page layout
│   └── MainLayout.jsx  # Main application layout
├── pages/              # Page components
│   ├── FeedPage.jsx    # Main post feed page
│   ├── LoginPage.jsx   # User login page
│   ├── RegisterPage.jsx # User registration page
│   ├── ProfilePage.jsx # User profile page
│   └── ...             # Other page components
├── ProtectedRoutes/    # Route protection components
│   ├── ProtactedRoute.jsx # Route protection for authenticated users
│   └── ProtectedAuthRoute.jsx # Route protection for unauthenticated users
├── Services/           # API service functions
│   ├── AuthService.js # Authentication API calls
│   ├── FeedServices.js # Post and feed API calls
│   ├── CommentServices.js # Comment API calls
│   └── UserDetailsServices.js # User profile API calls
├── schema/             # Zod validation schemas
│   ├── LoginSchema.js  # Login form validation
│   └── RegisterSchema.js # Registration form validation
└── utils/              # Utility functions
    └── queryUtils.js   # React Query utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build

## 🔧 Configuration

### Environment Variables
The application uses the following API configuration:
- **Base URL**: `https://linked-posts.routemisr.com/`
- **Authentication**: Token-based (stored in localStorage)

### Theme Configuration
Themes can be customized in `src/Contexts/ThemeContext.jsx` by modifying the color schemes and adding new themes.

## 🎯 Core Components Explained

### Authentication System
- **AuthContext**: Manages global authentication state, user ID, and profile page state
- **Protected Routes**: Ensures users can only access appropriate pages based on authentication status
- **Form Validation**: Comprehensive validation using Zod schemas for data integrity

### Theme Management
- **ThemeContext**: Centralized theme state management with localStorage persistence
- **Dynamic Switching**: Real-time theme changes with smooth transitions
- **Color Schemes**: Pre-built color palettes with automatic dark/light mode adaptation

### Post Management
- **Infinite Scroll**: Efficient post loading with intersection observer
- **Real-time Updates**: Automatic feed refresh after post operations
- **Image Handling**: Support for post images with modal viewing

### Comment System
- **Nested Comments**: Hierarchical comment structure
- **Real-time Updates**: Immediate comment display after creation
- **Edit/Delete**: Full CRUD operations for comments

## 🎨 Design Philosophy

The application follows a **warm, filled design** approach:
- **No Empty Spaces**: Every area has visual interest and purpose
- **Decorative Elements**: Floating shapes and geometric patterns
- **Glass Morphism**: Modern backdrop blur effects
- **Smooth Transitions**: Seamless state and color changes
- **Responsive Layout**: Mobile-first design with progressive enhancement

## 🔒 Security Features

- **Token-based Authentication**: Secure user sessions
- **Protected Routes**: Access control for different user states
- **Form Validation**: Client-side validation with Zod schemas
- **Secure API Calls**: Authenticated requests with proper headers

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Progressive Enhancement**: Enhanced features for larger screens
- **Touch-Friendly**: Optimized touch targets and interactions
- **Flexible Layout**: Adaptive grid systems and spacing

## 🚀 Performance Optimizations

- **React Query**: Efficient data fetching and caching
- **Code Splitting**: Lazy loading of components and routes
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Optimization**: Vite-based build optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern React ecosystem
- Styled with Tailwind CSS and HeroUI
- Powered by Framer Motion animations
- Enhanced with comprehensive form validation

---

**Linkup** - Connect with friends and the world around you in a warm, vibrant community.
