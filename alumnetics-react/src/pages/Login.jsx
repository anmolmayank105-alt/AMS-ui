import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_ENDPOINTS } from '../services/api';

// Initial form state constant
const INITIAL_FORM_STATE = {
  email: '',
  password: '',
  rememberMe: false
};

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const validateInputs = useCallback(() => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    try {
      // Call real backend API
      console.log('🔐 Attempting login with email:', formData.email);
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });
      
      console.log('✅ Full login response:', JSON.stringify(response, null, 2));
      
      // Backend returns { success, message, data: { user, token } }
      // But api.post might already unwrap it
      let token, user;
      
      if (response.data) {
        // Response has .data property
        console.log('📦 Response has .data property');
        token = response.data.token;
        user = response.data.user;
      } else if (response.token && response.user) {
        // Response is already unwrapped
        console.log('📦 Response is unwrapped');
        token = response.token;
        user = response.user;
      } else {
        console.log('❌ Unexpected response structure:', response);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      console.log('✅ Token:', token ? 'Received (length: ' + token.length + ')' : 'Missing');
      console.log('✅ User:', JSON.stringify(user, null, 2));
      
      // Validate response
      if (!token || !user) {
        console.log('❌ Token or user missing!');
        throw new Error('Invalid response from server. Please try again.');
      }
      
      // Store auth token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      console.log('✅ Stored token in localStorage');
      console.log('✅ Stored user data in localStorage');
      console.log('✅ User role:', user.role);
      
      // Wait for localStorage to sync (important!)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify storage
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');
      console.log('✅ Verification - Token in storage:', storedToken ? 'YES' : 'NO');
      console.log('✅ Verification - User in storage:', storedUser ? 'YES' : 'NO');
      
      if (!storedToken || !storedUser) {
        console.error('❌ Failed to store in localStorage!');
        throw new Error('Failed to save login data. Please try again.');
      }
      
      // Redirect based on role
      const dashboardMap = {
        'student': '/dashboard/student',
        'alumni': '/dashboard/alumni',
        'admin': '/dashboard/admin'
      };
      
      const userRole = user?.role || 'student';
      const redirectPath = dashboardMap[userRole] || '/dashboard/student';
      
      console.log('✅ Redirecting to:', redirectPath);
      
      // Use replace to prevent back button issues
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Provide specific error messages
      let errorMessage = error.message || 'Login failed. Please check your credentials and try again.';
      
      // Check for specific error types
      if (errorMessage.includes('Invalid email or password')) {
        errorMessage = '❌ Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('deactivated') || errorMessage.includes('suspended')) {
        errorMessage = '🚫 Your account has been deactivated. Please contact support for assistance.';
      } else if (errorMessage.includes('not found')) {
        errorMessage = '❌ No account found with this email. Please register first.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = '🌐 Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Invalid response')) {
        errorMessage = '⚠️ Server error. Please try again or contact support.';
      }
      
      // Show user-friendly error message
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, validateInputs, navigate, formData.email, formData.password]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="min-h-screen flex">
        {/* Left Side - Welcome Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
            <div className="absolute top-1/4 right-16 w-16 h-16 bg-white/5 rounded-full animate-[float_6s_ease-in-out_infinite_2s]"></div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-[float_6s_ease-in-out_infinite_4s]"></div>
            <div className="absolute bottom-16 right-20 w-8 h-8 bg-white/15 rounded-full animate-[float_6s_ease-in-out_infinite_1s]"></div>
          </div>
          
          {/* Content */}
          <div className="flex items-center justify-center w-full p-12 relative z-10">
            <div className="text-center text-white">
              {/* Logo */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4">
                  <img src="/logo.jpeg" alt="ALUMNETICS" className="w-12 h-12 rounded-lg object-contain" />
                </div>
                <h1 className="text-3xl font-bold mb-2">ALUMNETICS</h1>
                <div className="w-24 h-1 bg-white/30 rounded-full mx-auto"></div>
              </div>
              
              {/* Welcome Text */}
              <div className="mb-12">
                <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-xl text-blue-100 leading-relaxed max-w-md mx-auto">
                  Connect with your alumni network and unlock new opportunities.
                </p>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
                {[
                  { icon: '👥', label: 'Alumni Network' },
                  { icon: '💼', label: 'Career Growth' },
                  { icon: '🎯', label: 'Opportunities' }
                ].map((feature, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <p className="text-sm text-blue-100">{feature.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md animate-[fadeInUp_0.6s_ease-out]">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3">
                <img src="/logo.jpeg" alt="ALUMNETICS" className="w-10 h-10 rounded-lg object-contain" />
                <h1 className="text-2xl font-bold text-gray-900">ALUMNETICS</h1>
              </div>
            </div>
            
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Welcome back! Please enter your details</p>
            </div>
            
            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* General Error Message */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{errors.general}</p>
                  </div>
                </div>
              )}
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Forgot password?</a>
              </div>
              
              {/* Sign In Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : 'Sign In'}
              </button>
            </form>
            
            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>
            
            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              {/* Facebook */}
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              {/* Google */}
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              {/* LinkedIn */}
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
            
            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?
                <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-800 font-medium ml-1">Sign up</button>
              </p>
            </div>
            
            {/* Back to Home */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center space-x-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span>Back to home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
