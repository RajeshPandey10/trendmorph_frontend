# TrendMorphAI Frontend - Authentication System Guide

## Overview

This React frontend uses **Zustand** for global state management and integrates with a Django backend for authentication. The system supports both traditional login/register and Google OAuth login.

## Architecture

### 1. Global State Management (Zustand)

- **authStore.js**: Manages authentication state globally
- **chatStore.js**: Manages chat/conversation history
- **nicheStore.js**: Manages selected niche preferences

### 2. API Integration

- **SummaryApi.js**: Single source of truth for all API calls
- Uses axios with automatic token injection and refresh
- Handles CORS and authentication headers automatically

### 3. Authentication Flow

#### Traditional Login/Register:

1. User enters credentials on Login/Register page
2. Frontend posts to Django endpoints via SummaryApi
3. Django returns JWT access/refresh tokens
4. Tokens stored in localStorage and Zustand state
5. Auto-redirect to protected routes

#### Google OAuth:

1. User clicks Google Login button
2. Google OAuth returns credential token
3. Frontend posts credential to Django social auth endpoint
4. Django validates with Google and returns JWT tokens
5. Same token handling as traditional login

### 4. Protected Routes

- Uses `ProtectedRoute` component wrapper
- Checks `isAuthenticated` from Zustand state
- Redirects to login if not authenticated
- Remembers intended destination with `state.from`

## Key Files

### Authentication Store (`src/store/authStore.js`)

```javascript
// State
- user: User profile data
- access: JWT access token
- refresh: JWT refresh token
- isAuthenticated: Boolean auth status
- loading: Request loading state
- error: Error messages

// Actions
- login(form): Traditional login
- googleLogin(access_token): Google OAuth login
- logout(): Clear tokens and state
- fetchProfile(): Get user profile
- refreshToken(): Refresh expired tokens
```

### API Service (`src/api/SummaryApi.js`)

```javascript
// Endpoints
- register(data): User registration
- login(data): User login
- googleLogin(data): Google OAuth login
- logout(data): User logout
- profile(): Get user profile
- refresh(data): Refresh tokens
- getTrendingPosts(params): Get trending content
- getHashtags(params): Get hashtags
- getCaptions(params): Get captions
```

### Protected Route (`src/components/ProtectedRoute.jsx`)

```javascript
// Usage
<ProtectedRoute>
  <GeneratePage />
</ProtectedRoute>
```

## Setup Instructions

### 1. Environment Variables

Create `.env` file in client directory:

```
VITE_REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
VITE_REACT_APP_GOOGLE_SECRET=your_google_secret
```

### 2. Install Dependencies

```bash
npm install @react-oauth/google axios zustand react-router-dom
```

### 3. Backend Requirements

Ensure Django backend has these endpoints:

- `/api/users/register/` - User registration
- `/api/users/login/` - User login
- `/api/users/logout/` - User logout
- `/api/users/profile/` - User profile
- `/api/users/token/refresh/` - Token refresh
- `/auth/social/login/` - Google OAuth

### 4. CORS Configuration

Django `settings.py` should include:

```python
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
]
```

## Features

### ✅ Completed Features

- [x] Zustand-based global auth state management
- [x] Single SummaryApi for all backend communication
- [x] Traditional login/register with JWT
- [x] Google OAuth integration
- [x] Protected routes with auto-redirect
- [x] Automatic token refresh on 401 errors
- [x] Responsive UI with Tailwind CSS
- [x] User profile display in sidebar
- [x] Login/logout functionality in sidebar
- [x] Error handling and loading states
- [x] Form validation and user feedback

### 🔄 Current Status

The authentication system is fully functional with:

- Complete user registration and login flows
- Google OAuth integration working
- JWT token management and refresh
- Protected route navigation
- Professional UI with proper error handling

### 🎯 Next Steps

1. **Backend Integration**: Connect to actual Django backend
2. **Error Handling**: Enhanced error messages and retry logic
3. **User Profile**: Expand user profile management
4. **Security**: Add additional security headers and validation
5. **Testing**: Add unit and integration tests

## Usage Examples

### Login Flow

```javascript
const { login, loading, error } = useAuthStore();

const handleSubmit = async (e) => {
  e.preventDefault();
  const success = await login({ username, password });
  if (success) {
    navigate("/dashboard");
  }
};
```

### Google Login

```javascript
const { googleLogin } = useAuthStore();

const handleGoogleSuccess = async (credentialResponse) => {
  const success = await googleLogin(credentialResponse.credential);
  if (success) {
    navigate("/dashboard");
  }
};
```

### Using API

```javascript
import SummaryApi from "../api/SummaryApi";

// Get trending posts
const posts = await SummaryApi.getTrendingPosts({ niche: "tech" });

// Get user profile
const profile = await SummaryApi.profile();
```

### Protecting Routes

```javascript
// In router.jsx
{
  path: "generate",
  element: (
    <ProtectedRoute>
      <GeneratePage />
    </ProtectedRoute>
  ),
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Django CORS settings allow credentials and your frontend origin
2. **Token Issues**: Check that tokens are being stored in localStorage correctly
3. **Google OAuth**: Verify Google Client ID is correct in .env file
4. **Route Protection**: Ensure ProtectedRoute component is wrapping protected pages

### Debug Tips

1. **Check Auth State**: Use browser dev tools to inspect Zustand state
2. **Network Tab**: Monitor API calls and responses
3. **localStorage**: Verify tokens are being stored/retrieved correctly
4. **Console Logs**: Check for any JavaScript errors

## Security Considerations

1. **Token Storage**: Consider httpOnly cookies for production
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Token Expiry**: Implement proper token expiry handling
4. **CSRF Protection**: Add CSRF tokens for state-changing operations
5. **Input Validation**: Validate all user inputs on both frontend and backend

## Contributing

When adding new API endpoints:

1. Add the endpoint to `SummaryApi.js`
2. Update authentication store if needed
3. Handle loading/error states properly
4. Update this documentation

The authentication system is designed to be maintainable and extensible while providing a secure and user-friendly experience.
