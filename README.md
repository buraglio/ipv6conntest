# IPv6 Connectivity Test

A basic web application for testing IPv4 and IPv6 connectivity. Should test basic connectivity, highlight better performing protocols, and provide a pass/fail for general IPv6 connectivity. A blatant copy of the functionality of the ip6.biz and test-ipv6.com sites. Given the change of test-ipv6.com going away, a simple open alternative is probably useful.

## Features

### IP Address Detection
- Automatically detects your IPv4 address
- Automatically detects your IPv6 address
- Displays ISP information for both protocols
- Shows browser and platform information

### Connectivity Tests
- **IPv4 Connectivity**: Tests your ability to connect to IPv4-only resources
- **IPv6 Connectivity**: Tests your ability to connect to IPv6-only resources
- **IPv4-only DNS Resolution**: Tests access to IPv4-only resources
- **IPv6-only DNS Resolution**: Tests access to IPv6-only resources
- **Dual Stack DNS Resolution**: Tests dual-stack capability
- **IPv6 Large Packet Test**: Tests IPv6 MTU and fragmentation handling

### Readiness Score
Provides an overall score (0-10) indicating your network's readiness for IPv6:
- **9-10**: Excellent - Fully ready for IPv6
- **7-8**: Good - Strong IPv6 support
- **5-6**: Moderate - Basic IPv6 capabilities
- **3-4**: Limited - Minimal IPv6 support
- **0-2**: Poor - Lacks IPv6 connectivity

## Design

The application features a clean, modern interface with:
- Color scheme inspired by ipv6.army (blue primary colors, teal accents)
- Responsive design that works on desktop, tablet, and mobile
- Clear visual indicators for test results (success/failure states)
- Smooth animations and transitions
- Easy-to-read typography

## How It Works

The application uses JavaScript to:
1. Detect your IP addresses via public API endpoints
2. Test connectivity to IPv4-only and IPv6-only resources
3. Perform DNS resolution tests for different scenarios
4. Calculate an overall readiness score based on all test results

All tests run automatically when the page loads, and you can re-run them at any time using the "Run Tests Again" button.

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks required - pure ES6+ JavaScript
- **Public APIs**: Uses ipify.org and ipinfo.io for IP detection

## Usage

Simply open `index.html` in any modern web browser. The tests will run automatically.

### Local Development

1. Clone or download this repository
2. Open `index.html` in your browser
3. No build process or dependencies required!

### Hosting

To deploy this application:
1. Upload all files to any web server
2. Access via HTTP/HTTPS
3. Ensure your server supports CORS if hosting the files separately

## Browser Compatibility

Works with all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## API Endpoints Used

The application queries the following public endpoints:
- `https://api.ipify.org` - IPv4 address detection
- `https://api64.ipify.org` - IPv6 address detection
- `https://ipinfo.io` - ISP and geolocation information
- `https://ipv4.icanhazip.com` - IPv4 connectivity test
- `https://ipv6.icanhazip.com` - IPv6 connectivity test
- Various Google IPv4/IPv6 endpoints for DNS tests

## Privacy

This application:
- Runs entirely in your browser
- Makes requests directly to public API services
- Does not store or transmit your data to any third-party services
- Does not use cookies or tracking

## License

Apache 2.0
## Credits

Inspired by:
- [ip6.biz](https://ip6.biz/) - IP detection functionality
- [test-ipv6.com](https://www.test-ipv6.com) - Connectivity testing approach
- [ipv6.army](https://www.ipv6.army) - Design and color scheme
