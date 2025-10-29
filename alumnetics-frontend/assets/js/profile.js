// Comprehensive Profile Management JavaScript
let currentUser = null;
let isEditMode = false;
let userSkills = [];
let userInterests = [];
let userAchievements = [];
let userProjects = [];
let userEducation = [];

// Initialize profile page
async function initProfile() {
    console.log('Initializing comprehensive profile...');
    
    // Check if API is loaded
    if (typeof window.AlumNeticsAPI === 'undefined') {
        console.log('Waiting for AlumNeticsAPI to load...');
        setTimeout(initProfile, 100);
        return;
    }

    // Check authentication
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!authToken || !userData) {
        console.log('Not authenticated, redirecting to login...');
        window.location.href = '../auth/login.html';
        return;
    }

    // Load user data from localStorage first (fast)
    loadUserDataFromStorage();
    
    // Then fetch fresh data from API
    await fetchUserProfile();
    
    // Setup edit mode toggle
    setupEditMode();
}

function loadUserDataFromStorage() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
        currentUser = JSON.parse(userDataString);
        console.log('Loaded user from storage:', currentUser);
        displayUserProfile(currentUser);
    }
}

async function fetchUserProfile() {
    try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            console.log('No auth token, using localStorage data only');
            return;
        }

        const response = await fetch('http://localhost:5000/api/profile/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Profile fetch failed with status:', response.status);
            // Continue using localStorage data
            return;
        }

        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('userData', JSON.stringify(currentUser));
            displayUserProfile(currentUser);
        } else {
            console.error('Failed to fetch profile:', result.message);
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        // Continue with localStorage data
    }
}

function displayUserProfile(user) {
    console.log('Displaying profile for:', user);

    // Update all profile data arrays
    userSkills = user.skills || [];
    userInterests = user.interests || [];
    userAchievements = user.achievements || [];
    userProjects = user.projects || [];
    userEducation = user.education || [];
    
    // Display the profile data in the page
    updateProfileDisplay(user);
}

function updateProfileDisplay(user) {
    console.log('Updating comprehensive profile display');
    
    // Update page title
    document.title = `${user.fullName || 'Student'} Profile - ALUMNETICS`;
    
    // Update dashboard links based on user role
    updateDashboardLinks(user.role);
    
    // Update main profile name
    const mainTitle = document.querySelector('h1.text-2xl.font-extrabold.text-gray-900');
    if (mainTitle) {
        mainTitle.textContent = user.fullName || 'Student';
    }
    
    // Update degree and institution line
    const profileSubtitle = document.querySelector('h1.text-2xl.font-extrabold.text-gray-900 + p.text-gray-700');
    if (profileSubtitle) {
        const degree = user.degree || 'Student';
        const institution = user.institution?.name || 'University';
        const graduationYear = user.graduationYear || '';
        profileSubtitle.textContent = `${degree} • ${institution}${graduationYear ? ' • Class of ' + graduationYear : ''}`;
    }
    
    // Update avatar with profile picture or initials
    const avatarDiv = document.querySelector('.w-28.h-28.rounded-2xl.bg-gradient-to-br');
    if (avatarDiv) {
        if (user.profilePicture) {
            // Show profile picture
            avatarDiv.innerHTML = `<img src="${user.profilePicture}" alt="${user.fullName || 'Profile'}" class="w-full h-full object-cover rounded-2xl" onerror="this.style.display='none'; this.parentElement.textContent='${user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?'}'; this.parentElement.classList.add('text-white', 'flex', 'items-center', 'justify-center', 'text-3xl', 'font-bold');">`;
        } else if (user.fullName) {
            // Show initials
            const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            avatarDiv.textContent = initials;
        }
        
        // Re-add status badge
        if (!avatarDiv.querySelector('.absolute.-bottom-2.-right-2')) {
            const badge = document.createElement('span');
            badge.className = 'absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200';
            badge.textContent = 'Active';
            avatarDiv.appendChild(badge);
        }
    }
    
    // Update bio/about section
    const bioElement = document.querySelector('.card.rounded-2xl.p-6.shadow-xl.lift .text-sm.text-gray-700.leading-6');
    if (bioElement) {
        if (user.bio) {
            bioElement.textContent = user.bio;
            bioElement.classList.remove('italic', 'text-gray-500');
            bioElement.classList.add('text-gray-700');
        } else {
            bioElement.textContent = 'No bio added yet. Click "Edit Profile" to add your bio and tell others about yourself!';
            bioElement.classList.add('italic', 'text-gray-500');
        }
    }
    
    // Update skills in header tags
    const headerSkillsContainer = document.querySelector('.flex-1 .mt-3.flex.flex-wrap.gap-2');
    if (headerSkillsContainer) {
        if (userSkills.length > 0) {
            const colors = ['purple', 'sky', 'amber', 'emerald', 'pink', 'indigo'];
            headerSkillsContainer.innerHTML = userSkills.slice(0, 6).map((skill, idx) => {
                const color = colors[idx % colors.length];
                return `<span class="text-xs px-2 py-1 rounded-full bg-${color}-50 text-${color}-700 border border-${color}-100">${skill}</span>`;
            }).join('');
        } else {
            headerSkillsContainer.innerHTML = '<span class="text-xs text-gray-500 italic">No skills added yet</span>';
        }
    }
    
    // Update skills sidebar
    const cards = document.querySelectorAll('.card.rounded-2xl.p-6.shadow-xl.lift');
    cards.forEach(card => {
        const title = card.querySelector('h2');
        if (title && title.textContent.trim() === 'Skills') {
            const container = card.querySelector('.flex.flex-wrap.gap-2');
            if (container) {
                if (userSkills.length > 0) {
                    const colors = ['purple', 'sky', 'emerald', 'amber', 'pink', 'indigo', 'rose', 'cyan'];
                    container.innerHTML = userSkills.map((skill, idx) => {
                        const color = colors[idx % colors.length];
                        return `<span class="text-xs px-2 py-1 rounded-full bg-${color}-50 text-${color}-700 border border-${color}-100">${skill}</span>`;
                    }).join('');
                } else {
                    container.innerHTML = '<p class="text-sm text-gray-500 italic">No skills added yet</p>';
                }
            }
        }
    });
    
    // Update education section
    updateEducationDisplay(user);
    
    // Update projects section
    updateProjectsDisplay(user);
    
    // Update achievements section
    updateAchievementsDisplay(user);
    
    // Update contact information
    updateContactDisplay(user);
}

function updateEducationDisplay(user) {
    const cards = document.querySelectorAll('.card.rounded-2xl.p-6.shadow-xl.lift');
    cards.forEach(card => {
        const title = card.querySelector('h2');
        if (title && title.textContent.trim() === 'Education') {
            const content = card.querySelector('.flex.items-start.gap-4')?.parentElement || card;
            
            if (userEducation && userEducation.length > 0) {
                const eduHTML = userEducation.map(edu => `
                    <div class="flex items-start gap-4 mb-4">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm">🎓</div>
                        <div>
                            <div class="font-semibold text-gray-900">${edu.degree || 'Degree'}</div>
                            <div class="text-sm text-gray-700">${edu.institution || 'Institution'}</div>
                            <div class="text-xs text-gray-500">${edu.startYear || ''} – ${edu.endYear || 'Present'}${edu.gpa ? ' • GPA: ' + edu.gpa : ''}</div>
                            ${edu.coursework && edu.coursework.length > 0 ? `
                                <ul class="mt-2 text-sm text-gray-700 list-disc pl-5">
                                    <li>Coursework: ${edu.coursework.join(', ')}</li>
                                    ${edu.activities && edu.activities.length > 0 ? `<li>Activities: ${edu.activities.join(', ')}</li>` : ''}
                                </ul>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
                content.innerHTML = `<h2 class="text-lg font-semibold text-gray-900 mb-4">Education</h2>${eduHTML}`;
            } else {
                // Show default from registration
                const degreeText = user.degree || 'Degree';
                const institutionText = user.institution?.name || 'Institution';
                const gradYear = user.graduationYear || new Date().getFullYear();
                content.innerHTML = `
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Education</h2>
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm">🎓</div>
                        <div>
                            <div class="font-semibold text-gray-900">${degreeText}</div>
                            <div class="text-sm text-gray-700">${institutionText}</div>
                            <div class="text-xs text-gray-500">Expected Graduation: ${gradYear}${user.department ? ' • ' + user.department : ''}</div>
                            <p class="mt-2 text-sm text-gray-500 italic">Click "Edit Profile" to add more education details</p>
                        </div>
                    </div>
                `;
            }
        }
    });
}

function updateProjectsDisplay(user) {
    const cards = document.querySelectorAll('.card.rounded-2xl.p-6.shadow-xl.lift');
    cards.forEach(card => {
        const title = card.querySelector('h2');
        if (title && title.textContent.trim() === 'Projects') {
            const contentParent = card;
            
            if (userProjects && userProjects.length > 0) {
                const projectsHTML = userProjects.map(project => {
                    const categoryColors = {
                        'Wet Lab': 'rose',
                        'Data': 'emerald',
                        'Software': 'blue',
                        'Research': 'purple',
                        'Other': 'gray'
                    };
                    const color = categoryColors[project.category] || 'gray';
                    
                    return `
                        <div class="p-4 rounded-xl border border-gray-200 bg-white/80">
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">${project.title || 'Untitled Project'}</div>
                                    <div class="text-xs text-gray-600 mt-1">${project.description || 'No description'}</div>
                                    ${project.technologies && project.technologies.length > 0 ? `
                                        <div class="flex flex-wrap gap-1 mt-2">
                                            ${project.technologies.map(tech => `<span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">${tech}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                                ${project.category ? `<span class="text-xs px-2 py-1 rounded-full bg-${color}-50 text-${color}-700 border border-${color}-100">${project.category}</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                
                contentParent.innerHTML = `
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Projects</h2>
                    <div class="space-y-4">${projectsHTML}</div>
                `;
            } else {
                contentParent.innerHTML = `
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Projects</h2>
                    <p class="text-sm text-gray-500 italic">No projects added yet. Click "Edit Profile" to showcase your work!</p>
                `;
            }
        }
    });
}

function updateAchievementsDisplay(user) {
    const cards = document.querySelectorAll('.card.rounded-2xl.p-6.shadow-xl.lift');
    cards.forEach(card => {
        const title = card.querySelector('h2');
        if (title && title.textContent.trim() === 'Achievements') {
            const contentParent = card;
            
            if (userAchievements && userAchievements.length > 0) {
                const icons = ['🏅', '🥇', '🥈', '🥉', '🏆', '⭐', '🎖️', '🤝', '📜', '💡'];
                const achievementsHTML = userAchievements.map((achievement, idx) => `
                    <li class="flex items-start gap-2">
                        <span>${icons[idx % icons.length]}</span>
                        <div>
                            <div class="font-medium text-gray-900">${achievement.title || 'Achievement'}</div>
                            ${achievement.description ? `<div class="text-sm text-gray-600">${achievement.description}</div>` : ''}
                            ${achievement.organization ? `<div class="text-xs text-gray-500">${achievement.organization}${achievement.date ? ' • ' + new Date(achievement.date).getFullYear() : ''}</div>` : ''}
                        </div>
                    </li>
                `).join('');
                
                contentParent.innerHTML = `
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
                    <ul class="space-y-3">${achievementsHTML}</ul>
                `;
            } else {
                contentParent.innerHTML = `
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
                    <p class="text-sm text-gray-500 italic">No achievements added yet. Click "Edit Profile" to add your accomplishments!</p>
                `;
            }
        }
    });
}

function updateContactDisplay(user) {
    const cards = document.querySelectorAll('.card.rounded-2xl.p-6.shadow-xl.lift');
    cards.forEach(card => {
        const title = card.querySelector('h2');
        if (title && title.textContent.trim() === 'Contact') {
            const contactContainer = card.querySelector('.space-y-2.text-sm') || card;
            
            let contactHTML = '';
            
            // Email
            if (user.email) {
                contactHTML += `<div class="flex items-center gap-2 text-gray-700"><span>📧</span> <a href="mailto:${user.email}" class="hover:underline">${user.email}</a></div>`;
            }
            
            // Phone
            if (user.phone) {
                contactHTML += `<div class="flex items-center gap-2 text-gray-700"><span>📱</span> ${user.phone}</div>`;
            }
            
            // Address
            if (user.address && (user.address.city || user.address.country)) {
                const location = [user.address.city, user.address.state, user.address.country].filter(Boolean).join(', ');
                if (location) {
                    contactHTML += `<div class="flex items-center gap-2 text-gray-700"><span>📍</span> ${location}</div>`;
                }
            }
            
            // Social Links
            const socials = [];
            if (user.socialLinks?.linkedin) socials.push(`<a href="${user.socialLinks.linkedin}" target="_blank" class="text-purple-700 hover:underline">LinkedIn</a>`);
            if (user.socialLinks?.github) socials.push(`<a href="${user.socialLinks.github}" target="_blank" class="text-purple-700 hover:underline">GitHub</a>`);
            if (user.socialLinks?.twitter) socials.push(`<a href="${user.socialLinks.twitter}" target="_blank" class="text-purple-700 hover:underline">Twitter</a>`);
            if (user.socialLinks?.portfolio) socials.push(`<a href="${user.socialLinks.portfolio}" target="_blank" class="text-purple-700 hover:underline">Portfolio</a>`);
            
            if (socials.length > 0) {
                contactHTML += `<div class="flex items-center gap-2 text-gray-700"><span>🔗</span> ${socials.join(' · ')}</div>`;
            }
            
            if (contactHTML) {
                contactContainer.innerHTML = contactHTML;
            } else {
                contactContainer.innerHTML = '<p class="text-sm text-gray-500 italic">No contact information available</p>';
            }
        }
    });
}

function setupEditMode() {
    // Add edit button to the page header
    const header = document.querySelector('header .flex.items-center.gap-2');
    if (header && !document.getElementById('editProfileBtn')) {
        const editBtn = document.createElement('button');
        editBtn.id = 'editProfileBtn';
        editBtn.className = 'px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg';
        editBtn.innerHTML = '✏️ Edit Profile';
        editBtn.onclick = showComprehensiveEditModal;
        
        header.appendChild(editBtn);
    }
}

function showComprehensiveEditModal() {
    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-60 z-50 overflow-y-auto';
    modal.style.paddingTop = '20px';
    modal.style.paddingBottom = '20px';
    
    modal.innerHTML = `
        <div class="min-h-screen flex items-start justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 relative">
                <div class="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">Edit Your Complete Profile</h2>
                            <p class="text-sm text-gray-600 mt-1">Update all your information to create an impressive profile</p>
                        </div>
                        <button onclick="closeEditModal()" type="button" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                    </div>
                </div>
            
            <div class="p-6 space-y-8">
                <!-- Profile Name & Picture -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>👤</span> Profile Name & Picture
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input type="text" id="modalFullName" value="${currentUser?.fullName || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="Enter your full name">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture URL</label>
                            <input type="url" id="modalProfilePicture" value="${currentUser?.profilePicture || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="https://example.com/photo.jpg">
                            <p class="text-xs text-gray-500 mt-1">Enter an image URL or leave blank for default avatar</p>
                        </div>
                    </div>
                </div>

                <!-- Bio -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>📝</span> About / Bio
                    </h3>
                    <textarea id="modalBio" rows="4" maxlength="500" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none" placeholder="Tell others about yourself, your interests, and what you're passionate about...">${currentUser?.bio || ''}</textarea>
                    <div class="text-xs text-gray-500 text-right"><span id="bioCount">${(currentUser?.bio || '').length}</span>/500</div>
                </div>

                <!-- Professional Info -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>💼</span> Professional Information
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Current Position</label>
                            <input type="text" id="modalPosition" value="${currentUser?.currentPosition || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="e.g., Software Engineer">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Company</label>
                            <input type="text" id="modalCompany" value="${currentUser?.currentCompany || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="e.g., Google">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                            <input type="text" id="modalIndustry" value="${currentUser?.industry || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="e.g., Technology">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                            <input type="number" id="modalExperience" value="${currentUser?.experience || ''}" min="0" max="50" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                        </div>
                    </div>
                </div>

                <!-- Contact & Address -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>📞</span> Contact & Address
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input type="tel" id="modalPhone" value="${currentUser?.phone || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="+1234567890">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                            <input type="text" id="modalStreet" value="${currentUser?.address?.street || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="123 Main St">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input type="text" id="modalCity" value="${currentUser?.address?.city || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="New York">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                            <input type="text" id="modalState" value="${currentUser?.address?.state || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="NY">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <input type="text" id="modalCountry" value="${currentUser?.address?.country || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="USA">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                            <input type="text" id="modalZipCode" value="${currentUser?.address?.zipCode || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="10001">
                        </div>
                    </div>
                </div>

                <!-- Skills -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>🎯</span> Skills
                    </h3>
                    <div class="flex gap-2">
                        <input type="text" id="modalSkillInput" class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="Add a skill (e.g., JavaScript, Python)">
                        <button onclick="addSkillInModal()" type="button" class="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition">Add</button>
                    </div>
                    <div id="modalSkillsList" class="flex flex-wrap gap-2 min-h-[40px] p-2 border-2 border-dashed border-gray-200 rounded-xl"></div>
                </div>

                <!-- Interests -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>❤️</span> Interests
                    </h3>
                    <div class="flex gap-2">
                        <input type="text" id="modalInterestInput" class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="Add an interest (e.g., Machine Learning, Photography)">
                        <button onclick="addInterestInModal()" type="button" class="px-6 py-2 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition">Add</button>
                    </div>
                    <div id="modalInterestsList" class="flex flex-wrap gap-2 min-h-[40px] p-2 border-2 border-dashed border-gray-200 rounded-xl"></div>
                </div>

                <!-- Social Links -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>🔗</span> Social Links
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                            <input type="url" id="modalLinkedin" value="${currentUser?.socialLinks?.linkedin || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="https://linkedin.com/in/yourprofile">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                            <input type="url" id="modalGithub" value="${currentUser?.socialLinks?.github || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="https://github.com/yourusername">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                            <input type="url" id="modalTwitter" value="${currentUser?.socialLinks?.twitter || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="https://twitter.com/yourusername">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Portfolio Website</label>
                            <input type="url" id="modalPortfolio" value="${currentUser?.socialLinks?.portfolio || ''}" class="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="https://yourportfolio.com">
                        </div>
                    </div>
                </div>

                <!-- Education -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>🎓</span> Education
                        <button onclick="addEducationEntry()" type="button" class="ml-auto text-sm px-4 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">+ Add Education</button>
                    </h3>
                    <div id="educationList" class="space-y-4"></div>
                </div>

                <!-- Projects -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>💡</span> Projects
                        <button onclick="addProjectEntry()" type="button" class="ml-auto text-sm px-4 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">+ Add Project</button>
                    </h3>
                    <div id="projectsList" class="space-y-4"></div>
                </div>

                <!-- Achievements -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span>🏆</span> Achievements
                        <button onclick="addAchievementEntry()" type="button" class="ml-auto text-sm px-4 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">+ Add Achievement</button>
                    </h3>
                    <div id="achievementsList" class="space-y-4"></div>
                </div>
            </div>

                <div class="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white rounded-b-2xl shadow-lg">
                    <button onclick="closeEditModal()" type="button" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition">Cancel</button>
                    <button onclick="saveAllProfileData()" type="button" class="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition shadow-lg">💾 Save All Changes</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add bio character counter
    const bioTextarea = document.getElementById('modalBio');
    bioTextarea.addEventListener('input', function() {
        document.getElementById('bioCount').textContent = this.value.length;
    });
    
    // Display current data
    displaySkillsInModal();
    displayInterestsInModal();
    displayEducationInModal();
    displayProjectsInModal();
    displayAchievementsInModal();
}

// Skills functions
function displaySkillsInModal() {
    const container = document.getElementById('modalSkillsList');
    if (!container) return;
    
    if (userSkills.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic">No skills added yet</p>';
        return;
    }
    
    container.innerHTML = userSkills.map((skill, index) => 
        `<span class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <span>${skill}</span>
            <button onclick="removeSkillInModal(${index})" type="button" class="text-purple-700 hover:text-red-600 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </span>`
    ).join('');
}

function addSkillInModal() {
    const input = document.getElementById('modalSkillInput');
    const skill = input.value.trim();
    
    if (skill && !userSkills.includes(skill)) {
        userSkills.push(skill);
        displaySkillsInModal();
        input.value = '';
    }
}

function removeSkillInModal(index) {
    userSkills.splice(index, 1);
    displaySkillsInModal();
}

// Interests functions
function displayInterestsInModal() {
    const container = document.getElementById('modalInterestsList');
    if (!container) return;
    
    if (userInterests.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic">No interests added yet</p>';
        return;
    }
    
    container.innerHTML = userInterests.map((interest, index) => 
        `<span class="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
            <span>${interest}</span>
            <button onclick="removeInterestInModal(${index})" type="button" class="text-pink-700 hover:text-red-600 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </span>`
    ).join('');
}

function addInterestInModal() {
    const input = document.getElementById('modalInterestInput');
    const interest = input.value.trim();
    
    if (interest && !userInterests.includes(interest)) {
        userInterests.push(interest);
        displayInterestsInModal();
        input.value = '';
    }
}

function removeInterestInModal(index) {
    userInterests.splice(index, 1);
    displayInterestsInModal();
}

// Education functions
function displayEducationInModal() {
    const container = document.getElementById('educationList');
    if (!container) return;
    
    if (userEducation.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic p-4 border-2 border-dashed border-gray-200 rounded-xl">No education entries yet. Click "+ Add Education" to add one.</p>';
        return;
    }
    
    container.innerHTML = userEducation.map((edu, index) => `
        <div class="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-gray-900">Education #${index + 1}</h4>
                <button onclick="removeEducationEntry(${index})" type="button" class="text-red-600 hover:text-red-800 text-sm">Remove</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" data-edu-index="${index}" data-field="degree" value="${edu.degree || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Degree (e.g., B.Sc. Computer Science)">
                <input type="text" data-edu-index="${index}" data-field="institution" value="${edu.institution || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Institution Name">
                <input type="text" data-edu-index="${index}" data-field="field" value="${edu.field || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Field of Study">
                <input type="text" data-edu-index="${index}" data-field="gpa" value="${edu.gpa || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="GPA (e.g., 3.8/4.0)">
                <input type="number" data-edu-index="${index}" data-field="startYear" value="${edu.startYear || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Start Year">
                <input type="number" data-edu-index="${index}" data-field="endYear" value="${edu.endYear || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="End Year">
                <input type="text" data-edu-index="${index}" data-field="coursework" value="${edu.coursework ? edu.coursework.join(', ') : ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" placeholder="Coursework (comma-separated)">
                <input type="text" data-edu-index="${index}" data-field="activities" value="${edu.activities ? edu.activities.join(', ') : ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" placeholder="Activities/Clubs (comma-separated)">
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', updateEducationFromInput);
    });
}

function addEducationEntry() {
    userEducation.push({
        degree: '',
        institution: '',
        field: '',
        startYear: null,
        endYear: null,
        gpa: '',
        coursework: [],
        activities: []
    });
    displayEducationInModal();
}

function removeEducationEntry(index) {
    userEducation.splice(index, 1);
    displayEducationInModal();
}

function updateEducationFromInput(e) {
    const index = parseInt(e.target.dataset.eduIndex);
    const field = e.target.dataset.field;
    const value = e.target.value;
    
    if (field === 'coursework' || field === 'activities') {
        userEducation[index][field] = value.split(',').map(item => item.trim()).filter(Boolean);
    } else if (field === 'startYear' || field === 'endYear') {
        userEducation[index][field] = value ? parseInt(value) : null;
    } else {
        userEducation[index][field] = value;
    }
}

// Projects functions
function displayProjectsInModal() {
    const container = document.getElementById('projectsList');
    if (!container) return;
    
    if (userProjects.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic p-4 border-2 border-dashed border-gray-200 rounded-xl">No projects yet. Click "+ Add Project" to showcase your work.</p>';
        return;
    }
    
    container.innerHTML = userProjects.map((project, index) => `
        <div class="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-gray-900">Project #${index + 1}</h4>
                <button onclick="removeProjectEntry(${index})" type="button" class="text-red-600 hover:text-red-800 text-sm">Remove</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" data-project-index="${index}" data-field="title" value="${project.title || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" placeholder="Project Title">
                <textarea data-project-index="${index}" data-field="description" class="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" rows="2" placeholder="Project Description">${project.description || ''}</textarea>
                <select data-project-index="${index}" data-field="category" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Select Category</option>
                    <option value="Software" ${project.category === 'Software' ? 'selected' : ''}>Software</option>
                    <option value="Research" ${project.category === 'Research' ? 'selected' : ''}>Research</option>
                    <option value="Data" ${project.category === 'Data' ? 'selected' : ''}>Data/Analytics</option>
                    <option value="Wet Lab" ${project.category === 'Wet Lab' ? 'selected' : ''}>Lab/Experimental</option>
                    <option value="Other" ${project.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
                <input type="url" data-project-index="${index}" data-field="link" value="${project.link || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Project Link/URL">
                <input type="text" data-project-index="${index}" data-field="technologies" value="${project.technologies ? project.technologies.join(', ') : ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" placeholder="Technologies/Tools Used (comma-separated)">
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('change', updateProjectFromInput);
    });
}

function addProjectEntry() {
    userProjects.push({
        title: '',
        description: '',
        category: '',
        link: '',
        technologies: [],
        date: new Date()
    });
    displayProjectsInModal();
}

function removeProjectEntry(index) {
    userProjects.splice(index, 1);
    displayProjectsInModal();
}

function updateProjectFromInput(e) {
    const index = parseInt(e.target.dataset.projectIndex);
    const field = e.target.dataset.field;
    const value = e.target.value;
    
    if (field === 'technologies') {
        userProjects[index][field] = value.split(',').map(item => item.trim()).filter(Boolean);
    } else {
        userProjects[index][field] = value;
    }
}

// Achievements functions
function displayAchievementsInModal() {
    const container = document.getElementById('achievementsList');
    if (!container) return;
    
    if (userAchievements.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-400 italic p-4 border-2 border-dashed border-gray-200 rounded-xl">No achievements yet. Click "+ Add Achievement" to add your accomplishments.</p>';
        return;
    }
    
    container.innerHTML = userAchievements.map((achievement, index) => `
        <div class="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-gray-900">Achievement #${index + 1}</h4>
                <button onclick="removeAchievementEntry(${index})" type="button" class="text-red-600 hover:text-red-800 text-sm">Remove</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" data-achievement-index="${index}" data-field="title" value="${achievement.title || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" placeholder="Achievement Title">
                <textarea data-achievement-index="${index}" data-field="description" class="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2" rows="2" placeholder="Description">${achievement.description || ''}</textarea>
                <input type="text" data-achievement-index="${index}" data-field="organization" value="${achievement.organization || ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Organization/Institution">
                <input type="date" data-achievement-index="${index}" data-field="date" value="${achievement.date ? new Date(achievement.date).toISOString().split('T')[0] : ''}" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('change', updateAchievementFromInput);
    });
}

function addAchievementEntry() {
    userAchievements.push({
        title: '',
        description: '',
        organization: '',
        date: new Date()
    });
    displayAchievementsInModal();
}

function removeAchievementEntry(index) {
    userAchievements.splice(index, 1);
    displayAchievementsInModal();
}

function updateAchievementFromInput(e) {
    const index = parseInt(e.target.dataset.achievementIndex);
    const field = e.target.dataset.field;
    const value = e.target.value;
    
    if (field === 'date') {
        userAchievements[index][field] = value ? new Date(value) : new Date();
    } else {
        userAchievements[index][field] = value;
    }
}

// Close modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.remove();
    }
}

// Save all profile data
async function saveAllProfileData() {
    const updatedData = {
        fullName: document.getElementById('modalFullName')?.value || '',
        profilePicture: document.getElementById('modalProfilePicture')?.value || '',
        bio: document.getElementById('modalBio')?.value || '',
        currentPosition: document.getElementById('modalPosition')?.value || '',
        currentCompany: document.getElementById('modalCompany')?.value || '',
        industry: document.getElementById('modalIndustry')?.value || '',
        experience: parseInt(document.getElementById('modalExperience')?.value) || 0,
        phone: document.getElementById('modalPhone')?.value || '',
        address: {
            street: document.getElementById('modalStreet')?.value || '',
            city: document.getElementById('modalCity')?.value || '',
            state: document.getElementById('modalState')?.value || '',
            country: document.getElementById('modalCountry')?.value || '',
            zipCode: document.getElementById('modalZipCode')?.value || ''
        },
        skills: userSkills,
        interests: userInterests,
        socialLinks: {
            linkedin: document.getElementById('modalLinkedin')?.value || '',
            github: document.getElementById('modalGithub')?.value || '',
            twitter: document.getElementById('modalTwitter')?.value || '',
            portfolio: document.getElementById('modalPortfolio')?.value || ''
        },
        education: userEducation.filter(edu => edu.degree && edu.institution), // Only save complete entries
        projects: userProjects.filter(proj => proj.title && proj.description), // Only save complete entries
        achievements: userAchievements.filter(ach => ach.title) // Only save complete entries
    };

    try {
        const response = await fetch('http://localhost:5000/api/profile/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('userData', JSON.stringify(currentUser));
            
            // Show success message
            showSuccessMessage('🎉 Profile saved successfully!');
            
            // Close modal
            closeEditModal();
            
            // Reload the page to show updated data
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            alert('Failed to save profile: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please check your connection and try again.');
    }
}

function showSuccessMessage(message) {
    const indicator = document.createElement('div');
    indicator.className = 'fixed top-20 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in';
    indicator.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">${message}</span>
    `;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.remove();
    }, 3000);
}

// Update dashboard links based on user role
function updateDashboardLinks(role) {
    console.log('Updating dashboard links for role:', role);
    
    let dashboardUrl = 'student-dashboard.html';
    let dashboardText = 'Student Dashboard';
    
    // Determine dashboard URL and text based on role
    if (role === 'alumni') {
        dashboardUrl = 'alumni-dashboard.html';
        dashboardText = 'Alumni Dashboard';
    } else if (role === 'admin') {
        dashboardUrl = 'admin-dashboard-v2.html';
        dashboardText = 'Admin Dashboard';
    } else if (role === 'faculty') {
        dashboardUrl = 'faculty-dashboard.html';
        dashboardText = 'Faculty Dashboard';
    }
    
    // Update all dashboard links
    const dashboardLinks = document.querySelectorAll('a[href*="dashboard.html"]');
    dashboardLinks.forEach(link => {
        link.href = dashboardUrl;
        // Update text content if it contains "Dashboard"
        if (link.textContent.includes('Dashboard')) {
            link.textContent = dashboardText;
        }
        // Update "Back to Dashboard" text
        const textNodes = Array.from(link.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        textNodes.forEach(node => {
            if (node.textContent.includes('Dashboard')) {
                node.textContent = node.textContent.replace(/Student Dashboard|Alumni Dashboard|Admin Dashboard|Faculty Dashboard/, dashboardText);
            }
        });
    });
    
    console.log('Dashboard links updated to:', dashboardUrl);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfile);
} else {
    initProfile();
}
