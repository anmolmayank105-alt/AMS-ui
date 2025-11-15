import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_ENDPOINTS } from '../services/api';

// List of registered universities
const REGISTERED_UNIVERSITIES = [
  // IITs
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur', 
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad',
  // NITs
  'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'NIT Calicut',
  // IIITs
  'IIIT Hyderabad', 'IIIT Bangalore', 'IIIT Delhi',
  // IIMs
  'IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'IIM Lucknow',
  // Delhi University Colleges
  "St. Stephen's College", 'Hindu College', 'Ramjas College', 
  'Shri Ram College of Commerce (SRCC)', 'Lady Shri Ram College (LSR)', 
  'Miranda House', 'Ram Lal Anand College',
  // Other Top Universities
  'Chandigarh University', 'Netaji Subhas Engineering College', 'Anna University',
  'Jadavpur University', 'BIT Mesra', 'VIT Vellore', 'BITS Pilani',
  'Manipal Institute of Technology', 'SRM University', 'Amity University',
  'Lovely Professional University (LPU)', 'Delhi Technological University (DTU)',
  'Guru Gobind Singh Indraprastha University (GGSIPU)', 'University of Mumbai',
  'Savitribai Phule Pune University', 'Jamia Millia Islamia',
  'Aligarh Muslim University (AMU)', 'Banaras Hindu University (BHU)'
];

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    linkedin: '',
    graduationYear: '',
    major: '',
    jobTitle: '',
    company: ''
  });
  const [errors, setErrors] = useState({});

  const roles = [
    { id: 'alumni', label: 'Alumni', icon: '👨‍🎓', color: 'blue' },
    { id: 'student', label: 'Student', icon: '🎓', color: 'green' },
    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫', color: 'purple' },
    { id: 'employer', label: 'Employer', icon: '💼', color: 'orange' },
    { id: 'institute', label: 'Institute', icon: '🏛️', color: 'indigo' },
    { id: 'admin', label: 'Admin', icon: '👤', color: 'gray' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Handle college input - filter universities
    if (name === 'college') {
      const searchTerm = value.toLowerCase().trim();
      if (searchTerm.length > 0) {
        const matches = REGISTERED_UNIVERSITIES.filter(uni =>
          uni.toLowerCase().includes(searchTerm)
        );
        setFilteredUniversities(matches);
        setShowSuggestions(true);
        setShowAllUniversities(false);
      } else {
        setShowSuggestions(false);
        setShowAllUniversities(false);
      }
    }
  };

  const selectUniversity = (universityName) => {
    setFormData(prev => ({ ...prev, college: universityName }));
    setShowSuggestions(false);
    setShowAllUniversities(false);
    if (errors.college) {
      setErrors(prev => ({ ...prev, college: '' }));
    }
  };

  const toggleAllUniversities = () => {
    setShowAllUniversities(!showAllUniversities);
    setShowSuggestions(false);
  };

  const handleCollegeFocus = () => {
    if (formData.college.trim().length > 0) {
      const searchTerm = formData.college.toLowerCase().trim();
      const matches = REGISTERED_UNIVERSITIES.filter(uni =>
        uni.toLowerCase().includes(searchTerm)
      );
      setFilteredUniversities(matches);
      setShowSuggestions(true);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    
    if (!selectedRole) newErrors.role = 'Please select a role';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.college) newErrors.college = 'College/University is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.country) newErrors.country = 'Country is required';
    // Phone is now optional
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    if (!validateInputs()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare registration data matching backend API
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || formData.firstName.trim(),
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        institution: formData.college, // Backend expects 'institution'
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        phoneNumber: formData.phone, // Backend expects 'phoneNumber'
      };

      // Add optional fields if provided
      if (formData.phone) registrationData.phoneNumber = formData.phone; // Only add if provided
      if (formData.linkedin) registrationData.linkedin = formData.linkedin;
      if (formData.graduationYear) registrationData.graduationYear = formData.graduationYear;
      if (formData.major) registrationData.department = formData.major; // Backend expects 'department'
      if (formData.jobTitle) registrationData.jobTitle = formData.jobTitle;
      if (formData.company) registrationData.company = formData.company;
      
      // Call backend API
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, registrationData);
      
      // Backend returns { success, message, data: { user, token } }
      const { token, user } = response.data || response;
      
      // Store auth token and user data for auto-login
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user));
      }
      
      // Show success message
      alert(response.message || 'Registration successful! Redirecting to your dashboard...');
      
      // Redirect to dashboard based on role
      const dashboardMap = {
        'student': '/dashboard/student',
        'alumni': '/dashboard/alumni',
        'faculty': '/dashboard/alumni',
        'employer': '/dashboard/alumni',
        'institute': '/dashboard/alumni',
        'admin': '/dashboard/admin'
      };
      
      const userRole = user?.role || selectedRole;
      navigate(dashboardMap[userRole] || '/dashboard/student');
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide specific error messages based on the error
      let errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Check for specific error types
      if (errorMessage.includes('already exists')) {
        errorMessage = '⚠️ An account with this email or phone number already exists. Please use a different email/phone or login to your existing account.';
      } else if (errorMessage.includes('invalid email')) {
        errorMessage = '❌ Please enter a valid email address.';
      } else if (errorMessage.includes('password')) {
        errorMessage = '🔒 Password must be at least 6 characters long.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = '🌐 Network error. Please check your internet connection and try again.';
      }
      
      // Show user-friendly error
      setErrors({
        general: errorMessage
      });
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="min-h-screen flex">
        {/* Left Side - Welcome Section */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
            <div className="absolute top-1/4 right-16 w-16 h-16 bg-white/5 rounded-full animate-[float_6s_ease-in-out_infinite_2s]"></div>
            <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-[float_6s_ease-in-out_infinite_4s]"></div>
            <div className="absolute bottom-16 right-20 w-8 h-8 bg-white/15 rounded-full animate-[float_6s_ease-in-out_infinite_1s]"></div>
          </div>
          
          <div className="flex items-center justify-center w-full p-12 relative z-10">
            <div className="text-center text-white">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4">
                  <img src="/logo.jpeg" alt="ALUMNETICS" className="w-12 h-12 rounded-lg object-contain" />
                </div>
                <h1 className="text-3xl font-bold mb-2">ALUMNETICS</h1>
                <div className="w-24 h-1 bg-white/30 rounded-full mx-auto"></div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-4xl font-bold mb-4">Join Our Network!</h2>
                <p className="text-xl text-blue-100 leading-relaxed max-w-md mx-auto">
                  Connect with thousands of alumni, students, and professionals across colleges.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 max-w-xs mx-auto">
                {[
                  { icon: '🎓', title: 'Multi-College Network', desc: 'Connect across institutions' },
                  { icon: '💼', title: 'Career Opportunities', desc: 'Access exclusive job openings' },
                  { icon: '🤝', title: 'Mentorship', desc: 'Learn from experienced professionals' }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-xl">{benefit.icon}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-blue-100">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-2xl animate-[fadeInUp_0.6s_ease-out] py-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center space-x-3">
                <img src="/logo.jpeg" alt="ALUMNETICS" className="w-10 h-10 rounded-lg object-contain" />
                <h1 className="text-2xl font-bold text-gray-900">ALUMNETICS</h1>
              </div>
            </div>
            
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Join the largest multi-college alumni network</p>
            </div>
            
            {/* Error Message Display */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-[shake_0.5s_ease-in-out]">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Registration Failed</h3>
                  <p className="text-sm text-red-700">{errors.general}</p>
                  {errors.general.includes('already exists') && (
                    <p className="text-sm text-red-600 mt-2">
                      <a href="/login" className="font-semibold underline hover:text-red-800">Login here</a> if you already have an account.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setErrors({ ...errors, general: '' })}
                  className="flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Registration Form */}
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Select Your Role</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => selectRole(role.id)}
                      className={`flex flex-col items-center p-4 border rounded-lg transition-all duration-300 ${
                        selectedRole === role.id
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white transform -translate-y-1 shadow-lg'
                          : 'border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className={`w-8 h-8 mb-2 flex items-center justify-center rounded-full ${
                        selectedRole === role.id ? 'bg-white/20' : `bg-${role.color}-100`
                      }`}>
                        <span className={selectedRole === role.id ? 'text-white' : `text-${role.color}-600`}>
                          {role.icon}
                        </span>
                      </div>
                      <span className="text-xs font-medium">{role.label}</span>
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
              
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className={`w-full px-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
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
              
              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              {/* College */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">College/University *</label>
                <div className="relative">
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    onFocus={handleCollegeFocus}
                    placeholder="Start typing or click dropdown..."
                    autoComplete="off"
                    className={`w-full px-4 py-3 pr-12 border ${errors.college ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                  {/* Dropdown Button */}
                  <button
                    type="button"
                    onClick={toggleAllUniversities}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Show all registered universities"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredUniversities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredUniversities.map((uni, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectUniversity(uni)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {uni}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* All Universities Grouped */}
                {showAllUniversities && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {/* IITs */}
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700 sticky top-0">
                      IITs (Indian Institute of Technology)
                    </div>
                    {REGISTERED_UNIVERSITIES.filter(u => u.startsWith('IIT ')).map((uni, idx) => (
                      <div
                        key={`iit-${idx}`}
                        onClick={() => selectUniversity(uni)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100"
                      >
                        {uni}
                      </div>
                    ))}
                    
                    {/* NITs */}
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700 sticky top-0">
                      NITs (National Institute of Technology)
                    </div>
                    {REGISTERED_UNIVERSITIES.filter(u => u.startsWith('NIT ')).map((uni, idx) => (
                      <div
                        key={`nit-${idx}`}
                        onClick={() => selectUniversity(uni)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100"
                      >
                        {uni}
                      </div>
                    ))}
                    
                    {/* IIITs & IIMs */}
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700 sticky top-0">
                      IIITs & IIMs
                    </div>
                    {REGISTERED_UNIVERSITIES.filter(u => u.startsWith('IIIT ') || u.startsWith('IIM ')).map((uni, idx) => (
                      <div
                        key={`iiit-iim-${idx}`}
                        onClick={() => selectUniversity(uni)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100"
                      >
                        {uni}
                      </div>
                    ))}
                    
                    {/* Other Universities */}
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-700 sticky top-0">
                      Other Top Universities
                    </div>
                    {REGISTERED_UNIVERSITIES.filter(u => !u.startsWith('IIT ') && !u.startsWith('NIT ') && !u.startsWith('IIIT ') && !u.startsWith('IIM ')).map((uni, idx) => (
                      <div
                        key={`other-${idx}`}
                        onClick={() => selectUniversity(uni)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {uni}
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.college && <p className="text-red-500 text-sm mt-1">{errors.college}</p>}
                <p className="text-xs text-gray-500 mt-1">Type to search or click dropdown to see all registered universities</p>
              </div>
              
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
              
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="2"
                  className={`w-full px-4 py-3 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              
              {/* City & Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className={`w-full px-4 py-3 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter your country"
                    className={`w-full px-4 py-3 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>
              </div>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200`}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              {/* Optional Information Toggle */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => setShowOptional(!showOptional)}
                  className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <span>Professional & Academic Information (Optional)</span>
                  <svg className={`w-4 h-4 transform transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {showOptional && (
                  <div className="mt-6 space-y-4 animate-[fadeIn_0.3s_ease-out]">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                        <select
                          name="graduationYear"
                          value={formData.graduationYear}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        >
                          <option value="">Select year</option>
                          {[2025, 2024, 2023, 2022, 2021, 2020].map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Major/Field of Study</label>
                        <input
                          type="text"
                          name="major"
                          value={formData.major}
                          onChange={handleChange}
                          placeholder="e.g., Computer Science"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms & Conditions */}
              <div className="flex items-start">
                <input type="checkbox" required className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1" />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
                </label>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </button>
            </form>
            
            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?
                <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800 font-medium ml-1">Sign in</button>
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

export default Register;
