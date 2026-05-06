class RideShareApp {
    constructor() {
        this.users = [];
        this.volunteers = [];
        this.rideRequests = [];
        this.currentUser = null;
        this.currentVolunteer = null;
        this.loggedInUser = null;
        this.userType = null;
        this.passwordResetCodes = new Map(); // Store reset codes with expiry
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    // Data Management
    loadData() {
        const savedUsers = localStorage.getItem('rideShareUsers');
        const savedVolunteers = localStorage.getItem('rideShareVolunteers');
        const savedRideRequests = localStorage.getItem('rideShareRequests');

        if (savedUsers) this.users = JSON.parse(savedUsers);
        if (savedVolunteers) this.volunteers = JSON.parse(savedVolunteers);
        if (savedRideRequests) this.rideRequests = JSON.parse(savedRideRequests);
    }

    saveData() {
        localStorage.setItem('rideShareUsers', JSON.stringify(this.users));
        localStorage.setItem('rideShareVolunteers', JSON.stringify(this.volunteers));
        localStorage.setItem('rideShareRequests', JSON.stringify(this.rideRequests));
    }

    // Authentication System
    checkAuthStatus() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        const userType = localStorage.getItem('userType');
        
        if (loggedInUser && userType) {
            this.loggedInUser = JSON.parse(loggedInUser);
            this.userType = userType;
            this.showMainApp();
        } else {
            this.showAuthPortal();
        }
    }

    setupEventListeners() {
        // Authentication forms
        document.getElementById('login-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signup-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        document.getElementById('forgot-password-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        document.getElementById('reset-password-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResetPassword();
        });

        // Auth switch links
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        document.getElementById('show-forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPasswordForm();
        });

        document.getElementById('show-login-from-forgot').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        document.getElementById('show-login-from-reset').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation (only setup if user is logged in)
        if (this.loggedInUser) {
            this.setupMainAppEventListeners();
        }
    }

    setupMainAppEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // User form
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUserInfo();
        });

        // Edit user buttons
        document.getElementById('edit-user').addEventListener('click', () => this.enableUserEdit());
        document.getElementById('cancel-edit').addEventListener('click', () => this.cancelUserEdit());

        // Request ride button (main)
        document.getElementById('request-ride-main').addEventListener('click', () => this.requestRideFromMain());

        // Riders form
        document.getElementById('riders-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.requestRide();
        });

        // Add rider button
        document.getElementById('add-rider').addEventListener('click', () => this.addRiderField());

        // Volunteer form
        document.getElementById('volunteer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerVolunteer();
        });

        // Location type radio buttons
        document.querySelectorAll('input[name="location-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleLocationTypeChange(e.target.value));
        });

        // Get location button
        document.getElementById('get-location').addEventListener('click', () => this.getCurrentLocation());
    }

    // Authentication UI Management
    showAuthPortal() {
        document.getElementById('auth-portal').style.display = 'block';
        document.getElementById('main-app').style.display = 'none';
        this.showLoginForm();
    }

    showMainApp() {
        document.getElementById('auth-portal').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        this.setupMainAppEventListeners();
        this.updateUI();
        
        // Show appropriate portal based on user type
        if (this.userType === 'volunteer') {
            this.switchView('volunteer');
        } else {
            this.switchView('user');
        }
    }

    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('forgot-password-form').style.display = 'none';
        document.getElementById('reset-password-form').style.display = 'none';
    }

    showSignupForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        document.getElementById('forgot-password-form').style.display = 'none';
        document.getElementById('reset-password-form').style.display = 'none';
    }

    showForgotPasswordForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('forgot-password-form').style.display = 'block';
        document.getElementById('reset-password-form').style.display = 'none';
    }

    showResetPasswordForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('forgot-password-form').style.display = 'none';
        document.getElementById('reset-password-form').style.display = 'block';
    }

    // Authentication Logic
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Find user in database
        const user = this.users.find(u => u.email === email && u.password === password);
        const volunteer = this.volunteers.find(v => v.email === email && v.password === password);

        if (user || volunteer) {
            const loggedInUser = user || volunteer;
            const userType = user ? 'rider' : 'volunteer';
            
            this.loggedInUser = loggedInUser;
            this.userType = userType;
            
            // Save session
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
            localStorage.setItem('userType', userType);
            
            this.showNotification('Login successful!');
            this.showMainApp();
            
            // Clear form
            document.getElementById('login-form-element').reset();
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const userType = document.getElementById('user-type').value;

        // Validation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Check if user already exists
        const existingUser = this.users.find(u => u.email === email);
        const existingVolunteer = this.volunteers.find(v => v.email === email);

        if (existingUser || existingVolunteer) {
            this.showNotification('An account with this email already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            password: password, // In production, this should be hashed
            address: '',
            createdAt: new Date().toISOString()
        };

        if (userType === 'volunteer') {
            newUser.capacity = 4;
            newUser.location = null;
            this.volunteers.push(newUser);
        } else {
            this.users.push(newUser);
        }

        this.saveData();
        this.showNotification('Account created successfully! Please login.');
        
        // Clear form and show login
        document.getElementById('signup-form-element').reset();
        this.showLoginForm();
    }

    // Password Recovery Logic
    handleForgotPassword() {
        const email = document.getElementById('forgot-email').value;

        // Find user in database
        const user = this.users.find(u => u.email === email);
        const volunteer = this.volunteers.find(v => v.email === email);

        if (!user && !volunteer) {
            this.showNotification('No account found with this email address', 'error');
            return;
        }

        // Generate 6-digit verification code
        const resetCode = this.generateResetCode();
        const expiryTime = Date.now() + (15 * 60 * 1000); // 15 minutes expiry

        // Store reset code
        this.passwordResetCodes.set(email, {
            code: resetCode,
            expiry: expiryTime,
            userType: user ? 'rider' : 'volunteer'
        });

        // In a real application, this would send an email
        // For demo purposes, we'll show the code in a notification
        this.showNotification(`Password reset code sent to ${email}. For demo: Code is ${resetCode}`, 'success');
        
        // Store the email for the reset form
        this.pendingResetEmail = email;
        
        // Clear form and show reset form
        document.getElementById('forgot-password-form-element').reset();
        this.showResetPasswordForm();
    }

    handleResetPassword() {
        const code = document.getElementById('reset-code').value;
        const newPassword = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-confirm-password').value;

        // Validation
        if (newPassword !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Check reset code
        const resetData = this.passwordResetCodes.get(this.pendingResetEmail);
        
        if (!resetData) {
            this.showNotification('Invalid or expired reset code', 'error');
            return;
        }

        if (Date.now() > resetData.expiry) {
            this.showNotification('Reset code has expired. Please request a new one.', 'error');
            this.passwordResetCodes.delete(this.pendingResetEmail);
            this.showForgotPasswordForm();
            return;
        }

        if (code !== resetData.code) {
            this.showNotification('Invalid verification code', 'error');
            return;
        }

        // Update password in database
        const userArray = resetData.userType === 'rider' ? this.users : this.volunteers;
        const userIndex = userArray.findIndex(u => u.email === this.pendingResetEmail);
        
        if (userIndex !== -1) {
            userArray[userIndex].password = newPassword;
            this.saveData();
        }

        // Clean up
        this.passwordResetCodes.delete(this.pendingResetEmail);
        this.pendingResetEmail = null;

        this.showNotification('Password reset successfully! Please login with your new password.');
        
        // Clear form and show login
        document.getElementById('reset-password-form-element').reset();
        this.showLoginForm();
    }

    generateResetCode() {
        // Generate 6-digit random code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    handleLogout() {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userType');
        this.loggedInUser = null;
        this.userType = null;
        this.currentUser = null;
        this.currentVolunteer = null;
        
        this.showNotification('Logged out successfully');
        this.showAuthPortal();
    }

    // Main App Functions
    switchView(view) {
        if (!this.loggedInUser) return;

        document.querySelectorAll('.nav-btn[data-view]').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.portal').forEach(portal => portal.classList.remove('active'));

        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        document.getElementById(`${view}-portal`).classList.add('active');

        if (view === 'volunteer') {
            this.updateRideRequests();
        }
    }

    saveUserInfo() {
        if (!this.loggedInUser || this.userType !== 'rider') return;

        const userData = {
            ...this.loggedInUser,
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            address: document.getElementById('user-address').value
        };

        // Update in database
        const userIndex = this.users.findIndex(u => u.id === this.loggedInUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = userData;
        }

        this.loggedInUser = userData;
        this.currentUser = userData;
        this.saveData();
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        
        this.showNotification('User information updated successfully!');
        this.showUserEditMode();
    }

    enableUserEdit() {
        if (!this.loggedInUser) return;

        // Populate form with current user data
        document.getElementById('user-name').value = this.loggedInUser.name || '';
        document.getElementById('user-email').value = this.loggedInUser.email || '';
        document.getElementById('user-phone').value = this.loggedInUser.phone || '';
        document.getElementById('user-address').value = this.loggedInUser.address || '';

        // Show edit buttons, hide save button
        document.querySelector('#user-form button[type="submit"]').style.display = 'none';
        document.getElementById('edit-user').style.display = 'none';
        document.getElementById('cancel-edit').style.display = 'inline-block';

        // Add update button
        if (!document.getElementById('update-user')) {
            const updateBtn = document.createElement('button');
            updateBtn.type = 'submit';
            updateBtn.id = 'update-user';
            updateBtn.textContent = 'Update User Info';
            updateBtn.style.background = '#48bb78';
            document.getElementById('user-form').appendChild(updateBtn);

            updateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveUserInfo();
            });
        }

        // Enable form fields (except destination)
        document.querySelectorAll('#user-form input').forEach(input => {
            if (input.id !== 'destination') {
                input.removeAttribute('readonly');
            }
        });
    }

    cancelUserEdit() {
        this.showUserEditMode();
        
        // Reset form to current user data
        if (this.loggedInUser) {
            document.getElementById('user-name').value = this.loggedInUser.name || '';
            document.getElementById('user-email').value = this.loggedInUser.email || '';
            document.getElementById('user-phone').value = this.loggedInUser.phone || '';
            document.getElementById('user-address').value = this.loggedInUser.address || '';
        }
    }

    showUserEditMode() {
        // Show save button, hide edit buttons
        document.querySelector('#user-form button[type="submit"]').style.display = 'inline-block';
        document.getElementById('edit-user').style.display = 'inline-block';
        document.getElementById('cancel-edit').style.display = 'none';

        // Remove update button if it exists
        const updateBtn = document.getElementById('update-user');
        if (updateBtn) {
            updateBtn.remove();
        }

        // Make form fields readonly if user exists (except destination)
        if (this.loggedInUser) {
            document.querySelectorAll('#user-form input').forEach(input => {
                if (input.id !== 'destination') {
                    input.setAttribute('readonly', true);
                }
            });
        }
    }

    addRiderField() {
        const ridersList = document.getElementById('riders-list');
        const riderItem = document.createElement('div');
        riderItem.className = 'rider-item';
        riderItem.innerHTML = `
            <button type="button" class="remove-rider" onclick="this.parentElement.remove()">×</button>
            <div class="form-group">
                <label>Name</label>
                <input type="text" class="rider-name" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" class="rider-email" required>
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="tel" class="rider-phone" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <input type="text" class="rider-address" required>
            </div>
        `;
        ridersList.appendChild(riderItem);
    }

    requestRideFromMain() {
        this.requestRide();
    }

    requestRide() {
        if (!this.loggedInUser || this.userType !== 'rider') {
            this.showNotification('Please login as a rider to request rides', 'error');
            return;
        }

        const destination = document.getElementById('destination').value;
        if (!destination) {
            this.showNotification('Please enter a destination address!', 'error');
            return;
        }

        if (!this.loggedInUser.address) {
            this.showNotification('Please update your pickup address first!', 'error');
            return;
        }

        const riders = [];
        document.querySelectorAll('.rider-item').forEach(item => {
            riders.push({
                name: item.querySelector('.rider-name').value,
                email: item.querySelector('.rider-email').value,
                phone: item.querySelector('.rider-phone').value,
                address: item.querySelector('.rider-address').value
            });
        });

        const rideRequest = {
            id: Date.now(),
            user: this.loggedInUser,
            riders: riders,
            destination: destination,
            status: 'pending',
            timestamp: new Date().toISOString(),
            volunteer: null
        };

        this.rideRequests.push(rideRequest);
        this.saveData();
        this.updateRideStatus(rideRequest);
        this.showNotification('Ride request submitted successfully!');
        
        // Clear forms
        document.getElementById('destination').value = '';
        document.getElementById('riders-list').innerHTML = `
            <div class="rider-item">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="rider-name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="rider-email" required>
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" class="rider-phone" required>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" class="rider-address" required>
                </div>
            </div>
        `;
    }

    updateRideStatus(rideRequest) {
        const statusDiv = document.getElementById('ride-status');
        let statusHTML = `
            <p><strong>Request ID:</strong> ${rideRequest.id}</p>
            <p><strong>Status:</strong> <span class="status-${rideRequest.status}">${rideRequest.status.toUpperCase()}</span></p>
            <p><strong>Requested at:</strong> ${new Date(rideRequest.timestamp).toLocaleString()}</p>
            <p><strong>Total Riders:</strong> ${rideRequest.riders.length + 1}</p>
            <p><strong>Destination:</strong> ${rideRequest.destination}</p>
        `;

        if (rideRequest.volunteer) {
            statusHTML += `<p><strong>Volunteer:</strong> ${rideRequest.volunteer.name}</p>`;
        }

        statusDiv.innerHTML = statusHTML;
    }

    registerVolunteer() {
        if (!this.loggedInUser || this.userType !== 'volunteer') {
            this.showNotification('Please login as a volunteer to register', 'error');
            return;
        }

        const locationType = document.querySelector('input[name="location-type"]:checked').value;
        let locationData = null;

        if (locationType === 'current') {
            if (!this.currentVolunteer || !this.currentVolunteer.location) {
                this.showNotification('Please get your current location first!', 'error');
                return;
            }
            locationData = {
                type: 'current',
                coordinates: this.currentVolunteer.location,
                address: null
            };
        } else {
            const manualAddress = document.getElementById('volunteer-address').value;
            if (!manualAddress) {
                this.showNotification('Please enter your starting address!', 'error');
                return;
            }
            locationData = {
                type: 'manual',
                coordinates: null,
                address: manualAddress
            };
        }

        const volunteerData = {
            ...this.loggedInUser,
            name: document.getElementById('volunteer-name').value || this.loggedInUser.name,
            email: document.getElementById('volunteer-email').value || this.loggedInUser.email,
            phone: document.getElementById('volunteer-phone').value || this.loggedInUser.phone,
            capacity: parseInt(document.getElementById('volunteer-capacity').value) || 4,
            location: locationData
        };

        // Update in database
        const volunteerIndex = this.volunteers.findIndex(v => v.id === this.loggedInUser.id);
        if (volunteerIndex !== -1) {
            this.volunteers[volunteerIndex] = volunteerData;
        }

        this.currentVolunteer = volunteerData;
        this.loggedInUser = volunteerData;
        this.saveData();
        localStorage.setItem('loggedInUser', JSON.stringify(volunteerData));
        
        this.showNotification('Volunteer registration successful!');
        
        // Clear form
        document.getElementById('volunteer-form').reset();
        document.getElementById('location-status').textContent = '';
        document.getElementById('location-status').className = '';
        this.handleLocationTypeChange('current');
    }

    handleLocationTypeChange(type) {
        const manualGroup = document.getElementById('manual-address-group');
        const currentDisplay = document.getElementById('current-location-display');

        if (type === 'manual') {
            manualGroup.style.display = 'block';
            currentDisplay.style.display = 'none';
        } else {
            manualGroup.style.display = 'none';
            currentDisplay.style.display = 'block';
        }
    }

    getCurrentLocation() {
        const statusDiv = document.getElementById('location-status');
        const getBtn = document.getElementById('get-location');
        
        if (!navigator.geolocation) {
            statusDiv.textContent = 'Geolocation is not supported by your browser';
            statusDiv.className = 'error';
            return;
        }

        statusDiv.textContent = 'Getting location...';
        statusDiv.className = '';
        getBtn.disabled = true;
        getBtn.textContent = 'Getting Location...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Store location temporarily
                if (!this.currentVolunteer) {
                    this.currentVolunteer = { location: location };
                } else {
                    this.currentVolunteer.location = location;
                }

                statusDiv.textContent = `Location found: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
                statusDiv.className = 'success';
                getBtn.disabled = false;
                getBtn.textContent = 'Update Location';
                
                this.showNotification('Current location captured successfully!');
            },
            (error) => {
                let errorMessage = 'Could not get location';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }
                
                statusDiv.textContent = errorMessage;
                statusDiv.className = 'error';
                getBtn.disabled = false;
                getBtn.textContent = 'Get Current Location';
                
                this.showNotification(errorMessage, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    updateRideRequests() {
        const requestsDiv = document.getElementById('ride-requests');
        const pendingRequests = this.rideRequests.filter(req => req.status === 'pending');
        
        if (pendingRequests.length === 0) {
            requestsDiv.innerHTML = '<p>No ride requests available</p>';
            return;
        }

        requestsDiv.innerHTML = pendingRequests.map(request => `
            <div class="ride-request">
                <h3>Request #${request.id}</h3>
                <p><strong>User:</strong> ${request.user.name}</p>
                <p><strong>Phone:</strong> ${request.user.phone}</p>
                <p><strong>Pickup Address:</strong> ${request.user.address}</p>
                <p><strong>Destination:</strong> ${request.destination}</p>
                <p><strong>Additional Riders:</strong> ${request.riders.length}</p>
                <p><strong>Total People:</strong> ${request.riders.length + 1}</p>
                <p><strong>Requested:</strong> ${new Date(request.timestamp).toLocaleString()}</p>
                <div class="ride-request-actions">
                    <button class="accept-ride" onclick="app.acceptRide(${request.id})">Accept Ride</button>
                </div>
            </div>
        `).join('');
    }

    acceptRide(requestId) {
        if (!this.currentVolunteer) {
            this.showNotification('Please register as a volunteer first!', 'error');
            return;
        }

        const request = this.rideRequests.find(req => req.id === requestId);
        if (!request) return;

        const totalPeople = request.riders.length + 1;
        if (totalPeople > this.currentVolunteer.capacity) {
            this.showNotification(`This ride requires ${totalPeople} people, but your capacity is ${this.currentVolunteer.capacity}`, 'error');
            return;
        }

        request.status = 'accepted';
        request.volunteer = this.currentVolunteer;
        this.saveData();

        this.updateRideRequests();
        this.calculateRoute(request);
        this.showNotification('Ride accepted successfully!');
        this.startLocationTracking(request);
    }

    calculateRoute(request) {
        const routeDiv = document.getElementById('route-info');
        const pickupAddresses = [request.user.address, ...request.riders.map(rider => rider.address)];
        
        // Get volunteer starting location
        let volunteerStart = null;
        let volunteerStartDisplay = null;
        
        if (this.currentVolunteer.location) {
            if (this.currentVolunteer.location.type === 'manual' && this.currentVolunteer.location.address) {
                volunteerStart = this.currentVolunteer.location.address;
                volunteerStartDisplay = this.currentVolunteer.location.address;
            } else if (this.currentVolunteer.location.type === 'current' && this.currentVolunteer.location.coordinates) {
                const coords = this.currentVolunteer.location.coordinates;
                volunteerStart = `${coords.lat},${coords.lng}`;
                volunteerStartDisplay = `Current Location (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`;
            }
        }

        // Build route array: volunteer start -> pickups -> destination
        let allAddresses = [];
        let routeDescription = [];
        
        if (volunteerStart) {
            allAddresses.push(volunteerStart);
            routeDescription.push(`<p><strong>Starting Point:</strong> ${volunteerStartDisplay}</p>`);
        }
        
        allAddresses.push(...pickupAddresses);
        routeDescription.push(`<h4>Pickup Locations:</h4>`);
        pickupAddresses.forEach((address, index) => {
            routeDescription.push(`<p><strong>Pickup ${index + 1}:</strong> ${address}</p>`);
        });
        
        allAddresses.push(request.destination);
        routeDescription.push(`<h4>Final Destination:</h4>`);
        routeDescription.push(`<p><strong>Destination:</strong> ${request.destination}</p>`);
        
        routeDiv.innerHTML = `
            <h3>Route Information</h3>
            <p><strong>Volunteer:</strong> ${this.currentVolunteer.name}</p>
            <p><strong>Total Stops:</strong> ${allAddresses.length}</p>
            <p><strong>Pickup Stops:</strong> ${pickupAddresses.length}</p>
            <p><strong>Final Destination:</strong> ${request.destination}</p>
            <div class="route-stops">
                ${routeDescription.join('')}
            </div>
            <button onclick="app.openMaps('${allAddresses.join('|')}')">Open in Maps</button>
        `;

        // Update map placeholder
        document.getElementById('map').innerHTML = `
            <div>
                <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 10px;"></i>
                <p>Map View</p>
                <p>Route calculated for ${allAddresses.length} stops</p>
                ${volunteerStart ? `<p>Starting from volunteer location</p>` : ''}
            </div>
        `;
    }

    openMaps(addresses) {
        const addressList = addresses.split('|');
        const origin = addressList[0];
        const destination = addressList[addressList.length - 1];
        const waypoints = addressList.slice(1, -1);

        // Check if origin is coordinates (lat,lng format)
        const isCoordinateOrigin = /^-?\d+\.\d+,-?\d+\.\d+$/.test(origin);
        
        // Format URLs based on whether origin is coordinates or address
        let googleMapsUrl, appleMapsUrl;
        
        if (isCoordinateOrigin) {
            // Origin is coordinates - use them directly
            const encodedOrigin = origin;
            const encodedDestination = encodeURIComponent(destination);
            const encodedWaypoints = waypoints.map(addr => encodeURIComponent(addr)).join('|');
            
            googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&waypoints=${encodedWaypoints}`;
            appleMapsUrl = `http://maps.apple.com/?saddr=${encodedOrigin}&daddr=${encodedDestination}&dirflg=d`;
        } else {
            // Origin is address - encode it
            const encodedOrigin = encodeURIComponent(origin);
            const encodedDestination = encodeURIComponent(destination);
            const encodedWaypoints = waypoints.map(addr => encodeURIComponent(addr)).join('|');
            
            googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&waypoints=${encodedWaypoints}`;
            appleMapsUrl = `http://maps.apple.com/?saddr=${encodedOrigin}&daddr=${encodedDestination}&dirflg=d`;
        }

        // Add waypoints to Apple Maps URL if there are any
        if (waypoints.length > 0) {
            const waypointString = waypoints.map(addr => `&daddr=${encodeURIComponent(addr)}`).join('');
            appleMapsUrl = `http://maps.apple.com/?saddr=${isCoordinateOrigin ? origin : encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}${waypoints.map(addr => `&daddr=${encodeURIComponent(addr)}`).join('')}&dirflg=d`;
        }

        // Try to detect device and open appropriate maps
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        console.log('Opening maps with:', {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            googleMapsUrl: googleMapsUrl,
            appleMapsUrl: appleMapsUrl,
            isIOS: isIOS,
            isAndroid: isAndroid
        });
        
        if (isIOS) {
            window.open(appleMapsUrl, '_blank');
        } else {
            window.open(googleMapsUrl, '_blank');
        }
    }

    startLocationTracking(request) {
        if (!navigator.geolocation) {
            this.showNotification('Location tracking not supported', 'error');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const volunteerLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Check proximity to user (simplified - in real app would calculate actual distance)
                this.checkProximity(volunteerLocation, request);
            },
            (error) => {
                console.error('Location tracking error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );

        // Store watch ID for cleanup
        this.locationWatchId = watchId;
    }

    checkProximity(volunteerLocation, request) {
        // Simplified proximity check
        const mockDistance = Math.random() * 10; // Mock distance in km
        
        if (mockDistance < 1) {
            this.showNotification(`Volunteer is approaching pickup location! (${mockDistance.toFixed(1)} km away)`);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type === 'error' ? 'error' : ''}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateUI() {
        if (!this.loggedInUser) return;

        // Update welcome messages
        const userWelcome = document.getElementById('user-welcome');
        const volunteerWelcome = document.getElementById('volunteer-welcome');
        
        if (userWelcome) {
            userWelcome.textContent = `Welcome, ${this.loggedInUser.name}!`;
        }
        if (volunteerWelcome) {
            volunteerWelcome.textContent = `Welcome, ${this.loggedInUser.name}!`;
        }

        // Populate user form if logged in as rider
        if (this.userType === 'rider') {
            document.getElementById('user-name').value = this.loggedInUser.name || '';
            document.getElementById('user-email').value = this.loggedInUser.email || '';
            document.getElementById('user-phone').value = this.loggedInUser.phone || '';
            document.getElementById('user-address').value = this.loggedInUser.address || '';
            
            this.currentUser = this.loggedInUser;
            this.showUserEditMode();
        }

        // Populate volunteer form if logged in as volunteer
        if (this.userType === 'volunteer') {
            document.getElementById('volunteer-name').value = this.loggedInUser.name || '';
            document.getElementById('volunteer-email').value = this.loggedInUser.email || '';
            document.getElementById('volunteer-phone').value = this.loggedInUser.phone || '';
            document.getElementById('volunteer-capacity').value = this.loggedInUser.capacity || 4;
            
            this.currentVolunteer = this.loggedInUser;
        }

        // Update ride requests if volunteer
        if (this.userType === 'volunteer') {
            this.updateRideRequests();
        }

        // Show ride status if rider has requests
        if (this.userType === 'rider' && this.rideRequests.length > 0) {
            const userRequests = this.rideRequests.filter(req => req.user.id === this.loggedInUser.id);
            if (userRequests.length > 0) {
                const lastRequest = userRequests[userRequests.length - 1];
                this.updateRideStatus(lastRequest);
            }
        }
    }
}

// Initialize the app
const app = new RideShareApp();
