import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/logo.jpeg" alt="ALUMNETICS Logo" className="w-12 h-12 rounded-xl object-contain" />
              <h1 className="text-2xl font-bold text-gray-900">ALUMNETICS</h1>
            </div>

            <nav className="hidden md:flex space-x-6">
              <a href="#news" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all duration-200 rounded-lg">
                <span className="text-lg">📰</span>
                <span>News</span>
              </a>
              <a href="#institutions" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all duration-200 rounded-lg">
                <span className="text-lg">🏫</span>
                <span>Institutions</span>
              </a>
              <a href="#jobs" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all duration-200 rounded-lg">
                <span className="text-lg">💼</span>
                <span>Job Board</span>
              </a>
              <a href="#connect" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 font-medium transition-all duration-200 rounded-lg">
                <span className="text-lg">🤝</span>
                <span>Connect & Engage</span>
              </a>
            </nav>

            <div className="flex items-center space-x-3">
              <button onClick={() => handleNavigate('/login')} className="flex items-center space-x-2 px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium transition-all duration-200 rounded-lg border border-purple-200 hover:border-purple-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                <span>Login</span>
              </button>
              <button onClick={() => handleNavigate('/register')} className="flex items-center space-x-2 px-3 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-medium transition-all duration-200 rounded-lg border border-teal-200 hover:border-teal-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Register</span>
              </button>
              <button onClick={() => handleNavigate('/register')} className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Join Network</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
            alt="Alumni networking" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-16 w-32 h-32 bg-blue-200/30 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-28 h-28 bg-cyan-300/25 rotate-45 rounded-xl"></div>
          <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-teal-200/30 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-300 via-cyan-400 to-teal-400 mx-auto mb-12"></div>
          
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-6 gap-6 p-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-white rounded-full"></div>
                  ))}
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 relative z-10">
                🌟 Welcome to AlumNetics
              </h2>
              <p className="text-lg text-blue-100 relative z-10">
                The premier platform connecting alumni across colleges and universities worldwide
              </p>
            </div>
          </div>
        
          {/* What We Offer Section */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-4 p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 text-center relative z-10">🎯 What We Offer</h3>
            <p className="text-lg text-cyan-100 text-center relative z-10 mb-8">Comprehensive alumni services designed to connect, grow, and succeed together</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {[
                { icon: '👥', title: 'Alumni Directory', desc: 'Connect with thousands of alumni worldwide. Find classmates, industry professionals, and mentors through verified profiles to expand your network.' },
                { icon: '💼', title: 'Job Board', desc: 'Access exclusive career opportunities from alumni companies. From internships to executive roles, find positions that value your background.' },
                { icon: '📅', title: 'Events & Reunions', desc: 'Join networking events, reunions, and professional meetups. From local gatherings to international conferences worldwide.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-cyan-100 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10">
              {[
                { icon: '🤝', title: 'Mentorship Program', desc: 'Guide students and recent graduates with your expertise. Make a lasting impact while developing leadership skills and giving back.' },
                { icon: '🔧', title: 'Workshops & Training', desc: 'Professional development sessions led by expert alumni and industry leaders. Stay current with trends and advance your career.' },
                { icon: '💰', title: 'Fundraising Campaigns', desc: 'Support scholarships, infrastructure, and innovative programs. Create opportunities for future generations through meaningful contributions.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-cyan-100 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-300 via-cyan-400 to-teal-400 mx-auto mb-12"></div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-200/30 rounded-full -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-200/30 rounded-full translate-x-20 translate-y-20"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-purple-300/20 rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-full h-0.5 bg-white/60 mx-auto mb-12"></div>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 border-2 border-white rounded-full"></div>
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4 relative z-10">📊 Our Impact</h3>
            <p className="text-lg text-purple-100 relative z-10 mb-8">Transforming alumni connections worldwide through innovative technology and meaningful relationships</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '👥', num: '250K+', title: 'Alumni', desc: 'Connected across the globe from diverse industries, creating a powerful network of professionals and leaders.', color: 'blue' },
              { icon: '🏫', num: '500+', title: 'Institutions', desc: 'Partner universities worldwide', color: 'green' },
              { icon: '🤝', num: '50K+', title: 'Mentorships', desc: 'Successful mentorship connections fostering career growth and professional guidance through structured programs.', color: 'purple' },
              { icon: '🎉', num: '1000+', title: 'Events', desc: 'Annual networking events including reunions, career fairs, and workshops to strengthen alumni bonds.', color: 'yellow' }
            ].map((item, idx) => (
              <div key={idx} className={`bg-white rounded-xl shadow-lg overflow-hidden text-center border-2 border-${item.color}-200`}>
                <div className={`h-24 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center`}>
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <div className="p-6">
                  <div className="text-3xl font-bold text-black mb-2">{item.num}</div>
                  <h4 className="text-lg font-semibold text-black mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Colleges Section */}
      <section id="institutions" className="py-16 bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-orange-200/30 rounded-full"></div>
          <div className="absolute bottom-32 left-16 w-24 h-24 bg-rose-200/40 rotate-45 rounded-lg"></div>
          <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-yellow-300/25 rounded-full"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-orange-300 via-rose-400 to-yellow-400 mx-auto mb-12"></div>
          <div className="text-center mb-16">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-6 gap-6 p-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-white rounded-full"></div>
                  ))}
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 relative z-10">
                🎓 Partner Colleges & Universities
              </h2>
              <p className="text-lg text-orange-100 relative z-10 mb-8">Join thousands of alumni from top Indian institutions and prestigious universities</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', icon: '🎓', name: 'IIT Delhi', desc: 'Premier engineering institute established in 1961. Leading in technology, research, and innovation with global recognition.', alumni: '25,000', color: 'red' },
              { img: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', icon: '🏛️', name: 'Chandigarh University', desc: 'Leading private university in Punjab known for innovation, research excellence, and global partnerships.', alumni: '22,000', color: 'blue' },
              { img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', icon: '⚙️', name: 'Netaji Subash Engineering College', desc: 'Premier engineering college known for technical excellence and producing skilled engineering professionals.', alumni: '12,000', color: 'indigo' },
              { img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', icon: '🌟', name: 'IIM Ahmedabad', desc: 'Premier business school renowned for management education and corporate leadership development.', alumni: '15,000', color: 'green' }
            ].map((college, idx) => (
              <div key={idx} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-${college.color}-200 card-hover overflow-hidden`}>
                <div className={`h-32 bg-gradient-to-br from-${college.color}-500 to-${college.color}-600 relative overflow-hidden`}>
                  <img src={college.img} alt={college.name} className="w-full h-full object-cover opacity-70" />
                  <div className={`absolute inset-0 bg-${college.color}-600/40 flex items-center justify-center`}>
                    <div className="text-4xl text-white">{college.icon}</div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{college.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{college.desc}</p>
                  <div className="text-sm font-medium text-purple-600">
                    {college.alumni} Alumni
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect & Engage Section */}
      <section id="connect" className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-300/20 to-blue-300/20 transform rotate-45"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-purple-400/10 transform rotate-12"></div>
        
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="w-full h-0.5 bg-white/60 mx-auto mb-12"></div>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 mb-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-4 p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                ))}
              </div>
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4 relative z-10">🤝 Connect & Engage</h3>
            <p className="text-lg text-blue-100 relative z-10 mb-8">Discover new ways to stay connected with your alumni community and build lasting relationships</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', bg: 'yellow', icon: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z', title: 'Alumni Highlights', desc: 'Featured stories of successful alumni making impact' },
              { img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', bg: 'pink', icon: 'M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.094-.22-2.139-.617-3.089l-.006-.014-.342-.829z', title: 'Alumni Podcast', desc: 'Audio stories and insights from our community' },
              { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', bg: 'emerald', icon: 'M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', title: 'Success Stories', desc: 'Testimonials and achievements from our network' },
              { img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', bg: 'cyan', icon: 'M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z', title: 'Library', desc: 'Resource hub with articles, guides, and insights' },
              { img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', bg: 'violet', icon: 'M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z', title: 'Virtual Events', desc: 'Online events, webinars, networking sessions' }
            ].map((item, idx) => (
              <div key={idx} className={`bg-white rounded-xl shadow-lg card-hover cursor-pointer overflow-hidden text-center border-2 border-${item.bg}-200`}>
                <div className={`h-32 bg-gradient-to-br from-${item.bg}-500 to-${item.bg}-600 relative overflow-hidden`}>
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover opacity-80" />
                  <div className={`absolute inset-0 bg-${item.bg}-600/60 flex items-center justify-center`}>
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={item.icon} clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-20 w-20 h-20 bg-teal-300/25 rotate-12 rounded-xl"></div>
          <div className="absolute bottom-20 right-32 w-28 h-28 bg-emerald-200/30 rounded-full"></div>
          <div className="absolute top-1/2 right-16 w-12 h-12 bg-cyan-300/40 rounded-lg rotate-45"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 mx-auto mb-12"></div>
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-5 gap-8 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-white rotate-45 rounded-sm"></div>
                  ))}
                </div>
              </div>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4 relative z-10">🌐 Explore the Network</h3>
              <p className="text-lg text-teal-100 relative z-10 mb-8">Discover opportunities and connections across institutions and professional networks worldwide</p>
            </div>
          </div>
          
          <div className="mb-12">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-teal-200">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 flex flex-col justify-center">
                  <h4 className="text-3xl font-bold text-gray-900 mb-4">Global Alumni Network</h4>
                  <p className="text-gray-600 mb-6">Connect with professionals across industries and continents. Share experiences, find mentors, and discover new opportunities through our vibrant alumni community.</p>
                  <button className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors self-start">
                    🌍 Explore Network
                  </button>
                </div>
                <div className="h-64 md:h-auto">
                  <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                       alt="Alumni networking event" 
                       className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: 'https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', color: 'red', title: 'Receive Daily News Alerts', features: ['Comprehensive Alumni Tracking', 'Verified Results Guarantee', 'Search across 400,000+ Global Sources'], brand: 'ALUMNETICS News' },
              { img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', color: 'purple', title: 'Access Updated Alumni Database', features: ['Receive Weekly Job Updates', 'Ensured Accuracy with Verified Results', 'Advanced Reporting & Filtering capabilities'], brand: 'ALUMNETICS Data Mine' },
              { img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', color: 'blue', title: 'Foster Alumni Engagement', features: ['Updated Alumni Directory', 'Spread Job Opportunities & Access to Mentorship', 'Raise Donations, Create Events, Connect Through Groups'], brand: 'ALUMNETICS for Institutions' },
              { img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', color: 'orange', title: 'Stay Connected with Ex-Employees', features: ['Boost Boomerang Hiring', 'Spread Brand Awareness & New Initiatives', 'Build Business via Alumni Referrals'], brand: 'ALUMNETICS for Corporates' }
            ].map((card, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg card-hover cursor-pointer overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                <div className={`h-32 bg-gradient-to-br from-${card.color}-500 to-${card.color}-600 relative overflow-hidden`}>
                  <img src={card.img} alt={card.brand} className="w-full h-full object-cover opacity-30" />
                  <div className={`absolute inset-0 bg-${card.color}-600/60`}></div>
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">A</span>
                      </div>
                      <div>
                        <div className="text-lg font-bold">ALUMNETICS</div>
                        <div className="text-sm opacity-90">{card.brand.split('ALUMNETICS ')[1]}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{card.title}</h4>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {card.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-center space-x-2">
                        <span className={`text-${card.color}-500`}>•</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`text-${card.color}-600 font-semibold hover:text-${card.color}-700 transition-colors`}>Learn More →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
               alt="Graduation celebration" 
               className="w-full h-full object-cover opacity-20" />
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-16 right-20 w-32 h-32 bg-indigo-300/15 rounded-full"></div>
          <div className="absolute top-1/3 right-10 w-16 h-16 bg-purple-300/20 rotate-45 rounded-lg"></div>
          <div className="absolute bottom-1/3 left-16 w-12 h-12 bg-white/15 rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-purple-300 via-white to-indigo-300 mx-auto mb-12"></div>
          <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/30 shadow-2xl">
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4">🚀 Ready to reconnect and grow?</h3>
            <p className="text-lg text-purple-100">Discover the power of your alumni community today!</p>
          </div>
          <button onClick={() => handleNavigate('/register')} className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            👥 Join Our Alumni Network
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.jpeg" alt="ALUMNETICS Logo" className="w-10 h-10 rounded-lg object-contain" />
                <h4 className="text-2xl font-bold">ALUMNETICS</h4>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Connecting alumni worldwide through meaningful relationships, career opportunities, and lifelong learning.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Twitter', 'LinkedIn'].map((social, idx) => (
                  <a key={idx} href="#" className="text-gray-400 hover:text-white transition-colors">
                    <span className="sr-only">{social}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2">
                {['About Us', 'Alumni Directory', 'Events', 'Job Board', 'News'].map((link, idx) => (
                  <li key={idx}><a href="#" className="text-gray-300 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-lg font-semibold mb-4">Contact</h5>
              <ul className="space-y-2">
                <li className="text-gray-300">📧 info@alumnetics.com</li>
                <li className="text-gray-300">📞 +1 (555) 123-4567</li>
                <li className="text-gray-300">📍 123 Alumni Ave, College Town, CT 12345</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 AlumNetics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
