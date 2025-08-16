# Social Media App - Project Analysis

## 🚀 Project Overview
A modern React-based social media application built with Vite, featuring user authentication, post management, commenting system, and user profiles. **Recently redesigned with a warm, dark red theme and dynamic color switching capabilities.**

## 📋 Technology Stack

### Core Technologies
- **React 19.1.0** - Modern React with latest features
- **Vite 7.0.4** - Fast build tool and development server
- **React Router DOM 7.7.1** - Client-side routing

### UI & Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **HeroUI React 2.8.2** - Modern UI component library
- **FontAwesome 7.0.0** - Icon library
- **Framer Motion 12.23.12** - Animation library

### State Management & Data Fetching
- **TanStack React Query 5.85.3** - Server state management
- **React Context API** - Client state management (Auth + Theme)
- **Axios 1.11.0** - HTTP client for API calls

### Form Handling & Validation
- **React Hook Form 7.62.0** - Form state management
- **Zod 4.0.14** - Schema validation
- **@hookform/resolvers 5.2.1** - Form validation integration

### Development Tools
- **ESLint 9.30.1** - Code linting
- **TypeScript types** - Type definitions for React

## 🎨 Design System

### Theme Architecture
- **ThemeContext.jsx** - Centralized theme management
- **Dynamic Color Switching** - 5 pre-built color schemes
- **Dark Red Default Theme** - Primary color scheme
- **Glass Morphism Effects** - Modern UI with backdrop blur
- **Decorative Elements** - Floating shapes and geometric patterns

### Color Schemes Available
1. **Dark Red** (Default) - Warm, passionate theme
2. **Deep Purple** - Elegant, sophisticated theme
3. **Ocean Blue** - Calm, professional theme
4. **Forest Green** - Natural, organic theme
5. **Sunset Orange** - Energetic, vibrant theme

### Design Features
- **Warm, Filled Design** - No empty spaces, rich visual elements
- **Decorative Shapes** - Floating circles, geometric elements
- **Gradient Overlays** - Subtle background gradients
- **Smooth Transitions** - 0.3s ease transitions for all color changes
- **Responsive Layout** - Mobile-first design approach
- **Glass Morphism** - Backdrop blur effects for modern feel

## 🏗️ Project Architecture

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   └── ThemeSwitcher.jsx # Dynamic theme switching
├── Contexts/           # React Context providers
│   ├── AuthContext.jsx # Authentication state
│   └── ThemeContext.jsx # Theme management
├── Layout/             # Layout components
├── pages/              # Page components
├── ProtectedRoutes/    # Route protection components
├── schema/             # Zod validation schemas
├── Services/           # API service functions
└── assets/             # Static assets
```

### Key Components

#### Authentication System
- **AuthContext.jsx** - Global authentication state management
- **LoginPage.jsx** - Redesigned with warm, filled design
- **RegisterPage.jsx** - Redesigned with warm, filled design
- **ProtectedAuthRoute.jsx** - Route protection for authenticated users
- **ProtactedRoute.jsx** - Route protection for unauthenticated users

#### Theme Management
- **ThemeContext.jsx** - Centralized theme state and color management
- **ThemeSwitcher.jsx** - UI component for changing color schemes
- **AuthLayout.jsx** - Redesigned with decorative background elements

#### Post Management
- **FeedPage.jsx** - Main feed displaying all posts
- **Post.jsx** - Individual post component
- **CreatePost.jsx** - Post creation interface
- **EditPostPage.jsx** - Post editing interface
- **PostDetailsPage.jsx** - Detailed post view

#### Comment System
- **Comments.jsx** - Comment display component
- **CreateComment.jsx** - Comment creation interface
- **CommentEditBox.jsx** - Comment editing interface
- **CommentHeader.jsx** - Comment header information

#### User Interface
- **Navbar.jsx** - Navigation component
- **ProfilePage.jsx** - User profile interface
- **PostHeader.jsx** - Post header information
- **PostBtns.jsx** - Post action buttons
- **PostStatistics.jsx** - Post statistics display
- **DropDown.jsx** - Dropdown menu component

#### Utility Components
- **ErrorMessage.jsx** - Error display component
- **FetchingIcon.jsx** - Loading indicator
- **LoadingPage.jsx** - Loading page component
- **NotFoundPage.jsx** - 404 error page

### API Services

#### Authentication Services (AuthService.js)
- `registerUser()` - User registration
- `loginUser()` - User login

#### Feed Services (FeedServices.js)
- `getAllPosts()` - Fetch all posts
- `postDetails()` - Get specific post details
- `createPost()` - Create new post
- `deletePost()` - Delete post
- `updatePost()` - Update existing post

#### Comment Services (CommentServices.js)
- `createComment()` - Create new comment
- `deleteComment()` - Delete comment
- `updateComment()` - Update existing comment

#### User Services (UserDetailsServices.js)
- `getUserDetails()` - Fetch user profile data
- `UploadUserImage()` - Upload user profile image

### Validation Schemas

#### Registration Schema (RegisterSchema.js)
- Name validation (3-20 characters)
- Email format validation
- Password strength requirements
- Password confirmation matching
- Age verification (18+ years)
- Gender validation

#### Login Schema (LoginSchama.js)
- Email format validation
- Password requirements

## 🔧 Configuration

### Vite Configuration
- React plugin for JSX support
- Tailwind CSS integration
- Development server configuration

### ESLint Configuration
- React-specific linting rules
- Hooks linting
- Refresh plugin for development

### Global CSS Enhancements
- Smooth theme transitions (0.3s ease)
- Custom scrollbar styling
- Floating animation keyframes
- Glass morphism effects
- Responsive design utilities

## 🌐 API Integration
- **Base URL**: `https://linked-posts.routemisr.com/`
- **Authentication**: Token-based (stored in localStorage)
- **Content-Type**: Multipart form data for file uploads

## 🔐 Security Features
- Protected routes for authenticated/unauthenticated users
- Token-based authentication
- Form validation with Zod schemas
- Secure password requirements

## 📱 Features
1. **User Authentication**
   - Registration with comprehensive validation
   - Login with email/password
   - Persistent authentication state
   - **Redesigned with warm, filled UI**

2. **Dynamic Theme System**
   - 5 pre-built color schemes
   - Real-time theme switching
   - Smooth color transitions
   - Glass morphism effects

3. **Post Management**
   - Create, read, update, delete posts
   - Post feed with sorting
   - Post details view

4. **Comment System**
   - Add comments to posts
   - Edit and delete comments
   - Comment threading

5. **User Profiles**
   - Profile data management
   - Profile image upload
   - User statistics

6. **Modern UI/UX**
   - **Dark red primary theme**
   - **Warm, filled design philosophy**
   - **Decorative background elements**
   - Responsive design with Tailwind CSS
   - Smooth animations with Framer Motion
   - Modern component library (HeroUI)
   - Loading states and error handling

## 🚀 Development Setup
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## 📦 Dependencies Summary
- **Production Dependencies**: 14 packages
- **Development Dependencies**: 9 packages
- **Total Package Size**: Modern, lightweight setup

## 🎨 Design Philosophy
The application now follows a **warm, filled design** approach with:
- **No empty spaces** - Every area has visual interest
- **Decorative elements** - Floating shapes and geometric patterns
- **Dark red theme** - Passionate, warm color palette
- **Glass morphism** - Modern backdrop blur effects
- **Smooth transitions** - Seamless color and state changes
- **Dynamic theming** - Easy color scheme switching

This social media app demonstrates modern React development practices with a clean architecture, comprehensive validation, robust feature set, and now features a beautiful, warm design system suitable for further development and scaling.
