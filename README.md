# ☕ Taksofon Coffee - Coffee Shop Website

Modern multilingual coffee shop website with online ordering system, real-time order tracking, and customer reviews.

## 🌟 Features

### Customer Features
- **Multilingual Support** - Kazakh, English, and Russian languages
- **Online Ordering** - Order coffee, tea, cold drinks with customization options
- **Real-time Order Tracking** - Track your order status live
- **Customer Reviews** - Leave reviews with photos and ratings
- **Shopping Cart** - Add multiple items with quantity control
- **Responsive Design** - Works on desktop, tablet, and mobile devices

### Admin Features
- **Order Management** - View and update order statuses
- **Review Moderation** - Approve or reject customer reviews
- **Menu Management** - Add, edit, or remove menu items
- **Branch Management** - Manage multiple coffee shop locations

### Technical Features
- **Firebase Integration** - Real-time database for orders and reviews
- **JWT Authentication** - Secure admin panel access
- **Telegram Bot Integration** - Automated order notifications
- **PWA Support** - Progressive Web App capabilities
- **Browser Notifications** - Real-time order status updates

## 🚀 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- [Swiper.js](https://swiperjs.com/) - Touch slider
- [Font Awesome](https://fontawesome.com/) - Icons
- Custom i18n system for translations

### Backend
- PHP 7.4+
- Firebase Realtime Database
- JWT for authentication
- RESTful API architecture

### Services
- Firebase (Database, Storage, Messaging)
- Telegram Bot API
- Email notifications

## 📦 Installation

### Prerequisites
- PHP 7.4 or higher
- Web server (Apache/Nginx)
- Firebase account
- Telegram Bot (optional)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/taksofon-coffee.git
cd taksofon-coffee
```

2. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Realtime Database and Storage
   - Copy your Firebase config to `js/firebase-config.js`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. **Configure Backend**
   - Update `backend/config/config.php` with your settings
   - Update `php/config.php` with your database credentials
   - Change JWT secret in `backend/config/config.php`

4. **Set up Telegram Bot (Optional)**
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Update bot token in `php/telegram-bot.php`

5. **Configure Web Server**
   - Point document root to project folder
   - Ensure `.htaccess` files are enabled (Apache)
   - Set proper permissions for `logs/` directory

6. **Create Admin User**
   - Access admin panel at `/admin.html`
   - Use default credentials or create new user via backend

## 📁 Project Structure

```
taksofon-coffee/
├── backend/              # Backend API
│   ├── api/
│   │   ├── controllers/  # API controllers
│   │   ├── helpers/      # JWT, Response, Validator
│   │   ├── middleware/   # Authentication
│   │   └── models/       # Data models
│   ├── config/           # Configuration files
│   └── index.php         # API entry point
├── css/                  # Stylesheets
├── database/             # Database files
├── image/                # Images and icons
├── js/                   # JavaScript files
│   ├── firebase-*.js     # Firebase integration
│   ├── i18n.js           # Internationalization
│   ├── script.js         # Main application logic
│   └── admin.js          # Admin panel logic
├── logs/                 # Application logs
├── php/                  # PHP utilities
│   ├── orders.php        # Order processing
│   ├── reviews.php       # Review management
│   ├── telegram-bot.php  # Telegram integration
│   └── email-sender.php  # Email notifications
├── admin.html            # Admin panel
├── admin-orders.html     # Order management
├── index.html            # Main website
├── order-display.html    # Order display screen
└── order-tracking.html   # Customer order tracking
```

## 🔧 Configuration

### Firebase Database Structure
```
/drinks
  /{drinkId}
    - name
    - category
    - price
    - image
    
/orders
  /{orderId}
    - customerName
    - phone
    - items
    - status
    - timestamp
    
/reviews
  /{reviewId}
    - name
    - rating
    - text
    - photo
    - approved
    - timestamp
```

### Environment Variables
Create `.env` file (if using):
```env
JWT_SECRET=your_secret_key
FIREBASE_API_KEY=your_firebase_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

## 🎨 Customization

### Adding New Drinks
1. Add drink data to Firebase `/drinks` collection
2. Add images to `/image` folder
3. Update translations in `js/i18n.js`

### Changing Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --main-color: #667eea;
    --black: #192a56;
    --light-color: #666;
    --border: .1rem solid rgba(0,0,0,.2);
}
```

### Adding Languages
1. Add translations to `js/i18n.js`
2. Add language button in header
3. Update language switcher logic

## 📱 API Endpoints

### Orders
- `POST /backend/api/orders` - Create new order
- `GET /backend/api/orders` - Get all orders (admin)
- `PUT /backend/api/orders/{id}` - Update order status (admin)

### Reviews
- `POST /php/reviews.php` - Submit review
- `GET /php/reviews.php` - Get approved reviews
- `PUT /php/reviews.php` - Moderate review (admin)

### Authentication
- `POST /backend/api/auth/login` - Admin login
- `POST /backend/api/auth/verify` - Verify JWT token

## 🔒 Security

- JWT authentication for admin panel
- Input validation and sanitization
- CORS headers configured
- SQL injection prevention
- XSS protection
- File upload restrictions

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Swiper.js for the slider component
- Font Awesome for icons
- Firebase for backend services
- All contributors and testers

## 📞 Support

For support, email taksofoncoffee@gmail.com or contact via:
- WhatsApp: +7 (701) 250-57-77
- WhatsApp: +7 (700) 277-16-03
- TikTok: [@taksofon.coffee](https://www.tiktok.com/@taksofon.coffee)

## 🚧 Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Payment gateway integration
- [ ] Loyalty program
- [ ] Delivery tracking
- [ ] Advanced analytics dashboard
- [ ] Multi-branch inventory management

---

Made with ☕ and ❤️ by Taksofon Coffee Team
