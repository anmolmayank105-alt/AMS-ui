import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_ENDPOINTS } from '../services/api';
import { isAuthenticated, getCurrentUser } from '../utils/helpers';

// Default initial form state
const INITIAL_FORM_STATE = {
  fullName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  department: '',
  institution: '',
  degree: '',
  graduationYear: '',
  dateOfBirth: '',
  address: '',
  city: '',
  country: '',
  location: '',
  linkedin: '',
  jobTitle: '',
  company: '',
  skills: '',
  interests: '',
  education: [],
  projects: [],
  achievements: [],
  profileVisibility: true,
  showEmail: false,
  showPhone: false,
  allowMessages: true,
};

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user profile from API
      const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      const user = response.data || response.user || response;
      
      setUserData(user);
      
      // Pre-fill form with existing data
      setFormData({
        fullName: user.fullName || user.name || '',
        firstName: user.firstName || user.fullName?.split(' ')[0] || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.fullName?.split(' ').slice(1).join(' ') || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        department: user.department || '',
        institution: user.institution?.name || user.college || user.institution || '',
        degree: user.degree || '',
        graduationYear: user.graduationYear || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address?.street || user.fullAddress || '',
        city: user.address?.city || user.city || '',
        country: user.address?.country || user.country || '',
        location: user.location || user.city || '',
        linkedin: user.socialLinks?.linkedin || user.linkedin || '',
        jobTitle: user.currentPosition || user.jobTitle || '',
        company: user.currentCompany || user.company || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
        interests: Array.isArray(user.interests) ? user.interests.join(', ') : '',
        education: Array.isArray(user.education) ? user.education : [],
        projects: Array.isArray(user.projects) ? user.projects : [],
        achievements: Array.isArray(user.achievements) ? user.achievements : [],
        profileVisibility: user.privacy?.profileVisibility !== false,
        showEmail: user.privacy?.showEmail === true,
        showPhone: user.privacy?.showPhone === true,
        allowMessages: user.privacy?.allowMessages !== false,
      });
      
      // Set existing profile picture if available (but don't overwrite newly uploaded preview)
      if (user.profilePicture?.url && !profilePicPreview) {
        console.log('📸 Loading existing profile picture from user data');
        setProfilePicPreview(user.profilePicture.url);
      } else if (profilePicPreview) {
        console.log('📸 Keeping newly uploaded profile picture preview');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      alert('Failed to load profile. Please try again.');
      navigate('/dashboard/student');
    }
  }, [navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleProfilePicChange = useCallback((e) => {
    const file = e.target.files[0];
    console.log('🖼️ handleProfilePicChange called, file:', file);
    
    if (file) {
      console.log('  File name:', file.name);
      console.log('  File type:', file.type);
      console.log('  File size:', file.size, 'bytes');
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      console.log('✅ Validation passed, compressing and setting file state');
      setProfilePicFile(file);
      
      // Create compressed preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions (reduce size for faster loading)
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = height * (MAX_WIDTH / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = width * (MAX_HEIGHT / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
          
          console.log('✅ Image compressed from', reader.result.length, 'to', compressedDataUrl.length, 'bytes');
          console.log('   Setting profilePicPreview state...');
          setProfilePicPreview(compressedDataUrl);
          console.log('   State set! Preview should now be available');
        };
        img.src = reader.result;
      };
      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('❌ No file selected');
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare update data matching backend User model
      const updateData = {
        fullName: formData.fullName || `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        bio: formData.bio,
        department: formData.department,
        institution: {
          name: formData.institution,
          type: 'university' // You can make this dynamic later
        },
        degree: formData.degree,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: {
          street: formData.address,
          city: formData.city || formData.location,
          country: formData.country
        },
        currentPosition: formData.jobTitle,
        currentCompany: formData.company,
        socialLinks: {
          linkedin: formData.linkedin
        },
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        interests: formData.interests.split(',').map(s => s.trim()).filter(s => s),
        education: formData.education,
        projects: formData.projects,
        achievements: formData.achievements,
        privacy: {
          profileVisibility: formData.profileVisibility,
          showEmail: formData.showEmail,
          showPhone: formData.showPhone,
          allowMessages: formData.allowMessages,
        }
      };

      // Add profile picture as base64 if uploaded
      console.log('🖼️ Before adding profile picture:');
      console.log('  profilePicPreview:', profilePicPreview ? 'EXISTS (length: ' + profilePicPreview.length + ')' : 'NULL');
      console.log('  profilePicFile:', profilePicFile ? 'EXISTS' : 'NULL');
      
      if (profilePicPreview && profilePicFile) {
        console.log('✅ Adding profile picture to updateData');
        updateData.profilePicture = {
          url: profilePicPreview,
          publicId: `profile_${Date.now()}`
        };
      } else {
        console.log('❌ NOT adding profile picture - one of the values is missing');
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log('Sending update data:', updateData);
      console.log('Profile picture in update:', updateData.profilePicture);

      // Update profile via API
      const response = await api.put(API_ENDPOINTS.PROFILE.UPDATE, updateData);
      
      console.log('Update response:', response);
      console.log('Returned user profilePicture:', response?.data?.user?.profilePicture);
      
      // Update localStorage with new data
      if (response.data && response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }

      alert('Profile updated successfully! Reloading profile...');
      
      // Reload profile data to show updated picture
      await loadUserProfile();
      
      setSaving(false);
      
      // Redirect based on user role
      const role = userData?.role || 'student';
      navigate(`/profile/${role}`);
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
      setSaving(false);
    }
  }, [formData, userData, navigate, profilePicFile, profilePicPreview, loadUserProfile]);

  const handleCancel = useCallback(() => {
    if (confirm('Are you sure? Your changes will be lost.')) {
      navigate(-1);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-10 shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg font-semibold">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="AlumNetics" className="w-12 h-12 rounded-xl object-cover shadow-2xl ring-2 ring-white/50" />
              <div>
                <h1 className="text-2xl font-bold text-white">✏️ Edit Profile</h1>
                <p className="text-white/80 text-sm">Update your information</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-all"
            >
              ← Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Picture */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📸</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Profile Picture
              </span>
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Preview */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                  {profilePicPreview ? (
                    <img 
                      src={profilePicPreview} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                      {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload Button */}
              <div className="flex-1">
                <label htmlFor="profilePic" className="cursor-pointer">
                  <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-block shadow-md">
                    📷 Choose Profile Picture
                  </div>
                </label>
                <input
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Recommended: Square image, max 5MB (JPG, PNG, GIF)
                </p>
                {profilePicFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ New image selected: {profilePicFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Basic Information */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>👤</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Basic Information
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all bg-gray-50"
                  placeholder="john@example.com"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="+91-1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="India"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                placeholder="Street address"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🎓</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Academic Information
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="University Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Degree
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Bachelor of Technology"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  min="1950"
                  max="2050"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="2024"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💼</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Professional Information
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title / Position
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Company Name"
                />
              </div>
            </div>
          </div>

          {/* Skills & Interests */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💡</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Skills & Interests
              </span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Skills <span className="text-gray-400 text-xs">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="JavaScript, React, Node.js, Python"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interests <span className="text-gray-400 text-xs">(comma separated)</span>
                </label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  placeholder="Web Development, AI, Machine Learning"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🎓</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Education
              </span>
            </h2>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="mb-4 p-4 border-2 border-gray-200 rounded-xl">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Degree (e.g., B.Tech)"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[index].degree = e.target.value;
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[index].institution = e.target.value;
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Field of Study"
                    value={edu.field || ''}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[index].field = e.target.value;
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Year (e.g., 2024)"
                    value={edu.endYear || edu.year || ''}
                    onChange={(e) => {
                      const newEducation = [...formData.education];
                      newEducation[index].endYear = e.target.value;
                      setFormData(prev => ({ ...prev, education: newEducation }));
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newEducation = formData.education.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, education: newEducation }));
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  education: [...prev.education, { degree: '', institution: '', field: '', endYear: '' }]
                }));
              }}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-medium"
            >
              + Add Education
            </button>
          </div>

          {/* Projects */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>💻</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Projects
              </span>
            </h2>
            
            {formData.projects.map((project, index) => (
              <div key={index} className="mb-4 p-4 border-2 border-gray-200 rounded-xl">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={project.title || project.name || ''}
                  onChange={(e) => {
                    const newProjects = [...formData.projects];
                    newProjects[index].title = e.target.value;
                    setFormData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <textarea
                  placeholder="Description"
                  value={project.description || ''}
                  onChange={(e) => {
                    const newProjects = [...formData.projects];
                    newProjects[index].description = e.target.value;
                    setFormData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newProjects = formData.projects.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, projects: newProjects }));
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  projects: [...prev.projects, { title: '', description: '' }]
                }));
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium"
            >
              + Add Project
            </button>
          </div>

          {/* Achievements */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🏆</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Achievements
              </span>
            </h2>
            
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="mb-4 p-4 border-2 border-gray-200 rounded-xl">
                <input
                  type="text"
                  placeholder="Achievement Title"
                  value={achievement.title || achievement || ''}
                  onChange={(e) => {
                    const newAchievements = [...formData.achievements];
                    if (typeof newAchievements[index] === 'string') {
                      newAchievements[index] = { title: e.target.value };
                    } else {
                      newAchievements[index].title = e.target.value;
                    }
                    setFormData(prev => ({ ...prev, achievements: newAchievements }));
                  }}
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={achievement.description || ''}
                  onChange={(e) => {
                    const newAchievements = [...formData.achievements];
                    if (typeof newAchievements[index] === 'string') {
                      newAchievements[index] = { title: newAchievements[index], description: e.target.value };
                    } else {
                      newAchievements[index].description = e.target.value;
                    }
                    setFormData(prev => ({ ...prev, achievements: newAchievements }));
                  }}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newAchievements = formData.achievements.filter((_, i) => i !== index);
                    setFormData(prev => ({ ...prev, achievements: newAchievements }));
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  ✕ Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  achievements: [...prev.achievements, { title: '', description: '' }]
                }));
              }}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all font-medium"
            >
              + Add Achievement
            </button>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🔒</span>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Privacy Settings
              </span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div>
                  <label className="font-semibold text-gray-900 cursor-pointer">
                    Profile Visibility
                  </label>
                  <p className="text-sm text-gray-600">Allow others to view your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="profileVisibility"
                    checked={formData.profileVisibility}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div>
                  <label className="font-semibold text-gray-900 cursor-pointer">
                    Show Email
                  </label>
                  <p className="text-sm text-gray-600">Display your email on your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showEmail"
                    checked={formData.showEmail}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div>
                  <label className="font-semibold text-gray-900 cursor-pointer">
                    Show Phone
                  </label>
                  <p className="text-sm text-gray-600">Display your phone number on your profile</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showPhone"
                    checked={formData.showPhone}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div>
                  <label className="font-semibold text-gray-900 cursor-pointer">
                    Allow Messages
                  </label>
                  <p className="text-sm text-gray-600">Allow others to send you messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowMessages"
                    checked={formData.allowMessages}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                '💾 Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-4 bg-white/90 backdrop-blur-md text-gray-800 rounded-xl font-bold text-lg hover:bg-white transition-all shadow-lg border-2 border-gray-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;
