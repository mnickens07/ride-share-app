class RideShareApp {
    constructor() {
        this.users = [];
        this.volunteers = [];
        this.rideRequests = [];
        this.currentUser = null;
        this.currentVolunteer = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
    }

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

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
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

    switchView(view) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.portal').forEach(portal => portal.classList.remove('active'));

        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        document.getElementById(`${view}-portal`).classList.add('active');

        if (view === 'volunteer') {
            this.updateRideRequests();
        }
    }

    saveUserInfo() {
        const userData = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            address: document.getElementById('user-address').value,
            id: Date.now()
        };

        this.currentUser = userData;
        this.users.push(userData);
        this.saveData();
        this.showNotification('User information saved successfully!');
        
        // Update UI to show edit mode
        this.showUserEditMode();
    }

    enableUserEdit() {
        if (!this.currentUser) {
            this.showNotification('No user information to edit!', 'error');
            return;
        }

        // Populate form with current user data
        document.getElementById('user-name').value = this.currentUser.name;
        document.getElementById('user-email').value = this.currentUser.email;
        document.getElementById('user-phone').value = this.currentUser.phone;
        document.getElementById('user-address').value = this.currentUser.address;
        // Don't populate destination as it's ride-specific, not user-specific

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

            // Add event listener for update
            updateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.updateUserInfo();
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
        if (this.currentUser) {
            document.getElementById('user-name').value = this.currentUser.name;
            document.getElementById('user-email').value = this.currentUser.email;
            document.getElementById('user-phone').value = this.currentUser.phone;
            document.getElementById('user-address').value = this.currentUser.address;
        } else {
            document.getElementById('user-form').reset();
        }
    }

    updateUserInfo() {
        if (!this.currentUser) {
            this.showNotification('No user information to update!', 'error');
            return;
        }

        // Update user data
        const updatedData = {
            ...this.currentUser,
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            address: document.getElementById('user-address').value
        };

        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = updatedData;
        }

        this.currentUser = updatedData;
        this.saveData();
        this.showNotification('User information updated successfully!');
        
        this.showUserEditMode();
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
        if (this.currentUser) {
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

    requestRide() {
        if (!this.currentUser) {
            this.showNotification('Please save your information first!', 'error');
            return;
        }

        const destination = document.getElementById('destination').value;
        if (!destination) {
            this.showNotification('Please enter a destination address!', 'error');
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
            user: this.currentUser,
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
            name: document.getElementById('volunteer-name').value,
            email: document.getElementById('volunteer-email').value,
            phone: document.getElementById('volunteer-phone').value,
            capacity: parseInt(document.getElementById('volunteer-capacity').value),
            id: Date.now(),
            location: locationData
        };

        this.currentVolunteer = volunteerData;
        this.volunteers.push(volunteerData);
        this.saveData();
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
        if (this.currentVolunteer.location) {
            if (this.currentVolunteer.location.type === 'manual' && this.currentVolunteer.location.address) {
                volunteerStart = this.currentVolunteer.location.address;
            } else if (this.currentVolunteer.location.type === 'current' && this.currentVolunteer.location.coordinates) {
                volunteerStart = `${this.currentVolunteer.location.coordinates.lat},${this.currentVolunteer.location.coordinates.lng}`;
            }
        }

        // Build route array: volunteer start -> pickups -> destination
        let allAddresses = [];
        let routeDescription = [];
        
        if (volunteerStart) {
            allAddresses.push(volunteerStart);
            routeDescription.push(`<p><strong>Starting Point:</strong> ${volunteerStart}</p>`);
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
        const origin = encodeURIComponent(addressList[0]);
        const destination = encodeURIComponent(addressList[addressList.length - 1]);
        const waypoints = addressList.slice(1, -1).map(addr => encodeURIComponent(addr)).join('|');

        // Google Maps URL
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}`;
        
        // Apple Maps URL (for iOS devices)
        const appleMapsUrl = `http://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`;

        // Try to detect device and open appropriate maps
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
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
        // In a real app, you would calculate actual distance using Haversine formula
        // and use geocoding to convert addresses to coordinates
        
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
        // Update any UI elements that need initial data
        if (this.rideRequests.length > 0 && this.currentUser) {
            const lastRequest = this.rideRequests.find(req => req.user.id === this.currentUser.id);
            if (lastRequest) {
                this.updateRideStatus(lastRequest);
            }
        }

        // Show user edit mode if user exists
        if (this.currentUser) {
            this.showUserEditMode();
        }
    }
}

// Initialize the app
const app = new RideShareApp();