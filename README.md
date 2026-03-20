# Ride Share App

A comprehensive ride-sharing application built with vanilla JavaScript that connects users needing rides with approved volunteers who can provide transportation.

## Features

### User Portal
- **Contact Information Management**: Users can save their personal information (name, email, phone, address)
- **Multiple Rider Support**: Add additional riders with their contact details
- **Ride Requests**: Submit ride requests with pickup locations and rider information
- **Real-time Status Tracking**: Monitor ride request status (pending, accepted, completed)
- **Proximity Notifications**: Receive alerts when volunteers are approaching pickup locations

### Volunteer Portal
- **Volunteer Registration**: Approved volunteers can register with capacity limits
- **Location Services**: Automatic location detection for route optimization
- **Ride Request Dashboard**: View and filter available ride requests
- **Route Calculation**: Automatic route generation using Google Maps or Apple Maps
- **Capacity Management**: Set and enforce maximum rider capacity per volunteer

### Technical Features
- **Local Storage**: Persistent data storage using browser localStorage
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Geolocation Integration**: Real-time location tracking and proximity alerts
- **Cross-Platform Maps**: Automatic detection and integration with Google Maps (Android/Web) or Apple Maps (iOS)
- **Modern UI**: Clean, intuitive interface with smooth animations and transitions

## Setup Instructions

### Prerequisites
- Modern web browser with JavaScript enabled
- Location services enabled for full functionality
- Internet connection for map integration

### Installation
1. Download or clone the project files
2. Open `index.html` in your web browser
3. Enable location services when prompted for full functionality

### Usage

#### For Users
1. **Save Your Information**: Fill out the user contact form with your details
2. **Add Additional Riders**: Click "Add Another Rider" to include more people
3. **Request Ride**: Submit your ride request with pickup addresses
4. **Track Status**: Monitor your ride status in the Ride Status section

#### For Volunteers
1. **Register**: Fill out the volunteer registration form
2. **Set Capacity**: Specify how many riders you can accommodate
3. **View Requests**: Switch to Volunteer Portal to see available rides
4. **Accept Rides**: Click "Accept Ride" for requests you can fulfill
5. **Navigate**: Use the "Open in Maps" button to get turn-by-turn directions

## File Structure

```
ride-share-app/
├── index.html          # Main application HTML
├── styles.css          # Styling and responsive design
├── script.js           # Core application logic
└── README.md          # This documentation
```

## Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support (uses Apple Maps)
- **Edge**: Full support
- **Mobile Browsers**: Full support with responsive design

## Data Storage

The application uses browser localStorage to persist:
- User contact information
- Volunteer registrations
- Ride request history
- Current session data

**Note**: Data is stored locally in the browser and will persist between sessions. Clearing browser data will remove all stored information.

## Location Services

The app requires location services for:
- Volunteer location detection
- Proximity notifications
- Route optimization

Location data is only used within the browser session and is not transmitted to external servers.

## Map Integration

The application automatically detects the user's device and platform:
- **iOS Devices**: Opens Apple Maps for navigation
- **Android/Web**: Opens Google Maps for navigation

## Security Considerations

- All data is stored locally in the browser
- No external API keys required for basic functionality
- Location data is processed client-side only
- No server communication or data transmission

## Future Enhancements

Potential improvements for production use:
- Backend server integration for real-time updates
- User authentication and authorization
- Push notifications for ride updates
- Payment processing integration
- Advanced route optimization algorithms
- Real-time chat between users and volunteers

## Troubleshooting

### Location Services Not Working
- Ensure location services are enabled in your browser
- Check browser permissions for location access
- Try refreshing the page and granting permission again

### Maps Not Opening
- Verify internet connection
- Check if pop-up blockers are preventing map links
- Ensure default map application is properly configured

### Data Not Persisting
- Check that localStorage is enabled in your browser
- Avoid using private/incognito browsing mode
- Ensure browser is not clearing data on exit

## License

This project is provided as-is for educational and demonstration purposes.
