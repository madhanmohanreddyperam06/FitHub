# FitHub - AI Powered Fitness Trainer 🏋️‍♂️

A modern fitness web application with AI-powered chatbot, voice assistant, personalized workout plans, and nutrition guidance.

## 🛠️ Technology Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Web Speech API](https://img.shields.io/badge/Web_Speech_API-FF6B35?style=for-the-badge&logo=mozilla&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

## ✨ Key Features

### 🤖 AI-Powered Features
- **AI Chatbot "Chitti"**: Intelligent fitness assistant powered by Google Gemini 2.0 Flash API
  - Real-time fitness advice and workout guidance
  - Demo mode fallback when API rate limits are reached
  - Context-aware responses for exercises, nutrition, and training tips
  - Refresh functionality to clear conversation history
- **Voice Assistant**: Hands-free navigation using Web Speech API
  - Voice commands for navigating between workout pages
  - Speech synthesis for audio feedback
  - Support for opening external applications and websites
  - Real-time speech recognition and transcription

### 🏋️ Workout System
- **Multiple Workout Categories**: Comprehensive exercise library with animated demonstrations
  - Back workouts (5 different exercises with GIF demonstrations)
  - Chest workouts (5 different exercises with GIF demonstrations)
  - Biceps & Triceps workouts (5 different exercises with GIF demonstrations)
  - Shoulder workouts (5 different exercises with GIF demonstrations)
  - Leg workouts (5 different exercises with GIF demonstrations)
  - Full-body workout compilation page
- **Personalized Workout Plans**: AI-generated custom routines
  - Based on age, gender, height, weight, and fitness goals
  - Experience level adjustment (beginner, intermediate, advanced)
  - Time availability and frequency customization
  - Equipment selection and injury considerations
  - BMI calculation and health metrics
  - Downloadable workout plans with regeneration options

### 🥗 Nutrition Guidance
- **Advanced Nutrition Calculator**: Scientifically-based meal planning
  - BMR calculation using Mifflin-St Jeor Equation
  - TDEE calculation based on activity level (5 levels)
  - Calorie adjustment for specific goals (weight loss, muscle gain, maintenance)
  - Macro nutrient distribution (protein, carbs, fats)
  - Dietary preference support (omnivore, vegetarian, vegan, keto, paleo, mediterranean)
  - Allergy consideration in meal planning
  - Personalized meal plans for breakfast, lunch, dinner, and snacks

### 🎨 User Interface
- **Modern Responsive Design**: Mobile-first approach with seamless cross-device experience
  - CSS custom properties for consistent theming
  - Glassmorphism effects with backdrop blur
  - Smooth animations and transitions
  - Hamburger menu for mobile navigation
  - Professional footer with social media integration
- **Interactive Navigation**: Intuitive user experience
  - Dropdown workout selector with smooth animations
  - Back button navigation on all subpages
  - Feature buttons for quick access to tools
  - Modal system for additional features and legal pages

### 🔧 Technical Features
- **Client-Side Architecture**: Pure JavaScript implementation
  - No backend dependencies for core functionality
  - Local form processing and calculations
  - Efficient DOM manipulation
  - Event-driven programming model
- **Progressive Enhancement**: Graceful degradation
  - Demo responses when AI API is unavailable
  - Fallback functionality for unsupported features
  - Error handling and user feedback
- **Performance Optimization**: Smooth user experience
  - Lazy loading considerations
  - Optimized asset delivery
  - Efficient CSS animations

## 🚀 Quick Start

1. **Clone the repository**:

   ```bash
   git clone https://github.com/madhanmohanreddyperam06/AI-Fitness-Trainer.git
   cd AI-Fitness-Trainer
   ```

2. **Start a local server**:

   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve -p 8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

4. **Configure API Key** (optional for AI features):
   - Get API key from [Google AI Studio](https://aistudio.google.com/)
   - Update `script.js` with your API key

## 📁 Project Structure

```text
AI-Powered Fitness Trainer/
├── index.html                    # Main dashboard with AI features
├── script.js                     # Core JavaScript functionality (547 lines)
├── styles/
│   └── style.css                 # Main stylesheet with responsive design (846+ lines)
├── pages/                        # Workout and feature pages
│   ├── workout.html              # All workouts compilation page
│   ├── back.html                 # Back workout exercises
│   ├── chest.html                # Chest workout exercises
│   ├── biceps-triceps.html       # Arms workout exercises
│   ├── shoulder.html             # Shoulder workout exercises
│   ├── leg.html                  # Leg workout exercises
│   ├── personalized-plans.html  # AI workout plan generator
│   └── nutrition-guide.html      # Nutrition calculator and meal planner
├── ai_features/                  # AI and voice assistant modules
│   ├── ai.html                   # Standalone AI interface
│   ├── ai-style.css              # AI feature styling
│   ├── chatbot.js                # Chatbot logic
│   ├── voice.js                  # Voice recognition
│   └── pose.js                   # Pose detection (TensorFlow.js)
├── assets/                       # Images, GIFs, and media
│   ├── *.gif                     # Exercise demonstration GIFs (30+ files)
│   ├── *.svg                     # UI icons and graphics
│   ├── *.png                     # UI elements and screenshots
│   └── *.jpg                     # Background images
├── favicons/                     # Website icons and favicons
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── android-chrome-*.png
│   └── favicon-*.png
├── site.webmanifest             # PWA manifest
├── LICENSE                       # MIT License
└── README.md                     # This file
```

## 🏗️ Architecture Overview

### Frontend Architecture
The application follows a client-side architecture with no backend dependencies:

- **Single Page Application (SPA) Elements**: Seamless navigation between pages
- **Component-Based Design**: Modular HTML structure with reusable components
- **Event-Driven Programming**: JavaScript event listeners for user interactions
- **Progressive Enhancement**: Core functionality works without advanced features

### Key Technical Components

#### 1. AI Integration (`script.js`)
- **Gemini API Integration**: Google's generative AI for fitness advice
- **Demo Mode Fallback**: Pre-programmed responses when API is unavailable
- **Error Handling**: Graceful degradation for rate limits and API errors
- **Real-time Processing**: Async/await pattern for API calls

#### 2. Voice Assistant System (`script.js` + `ai_features/voice.js`)
- **Web Speech API**: Browser-native speech recognition
- **Speech Synthesis**: Text-to-speech for audio feedback
- **Command Processing**: Natural language parsing for navigation
- **Cross-Platform Support**: Works on Chrome, Firefox, Safari, Edge

#### 3. Workout Plan Generator (`pages/personalized-plans.html`)
- **Form Processing**: Client-side form validation and data collection
- **Algorithmic Planning**: Rule-based workout generation
- **BMI Calculation**: Health metric computations
- **Equipment Logic**: Adaptive exercise selection based on available equipment
- **Schedule Generation**: Weekly workout planning based on frequency

#### 4. Nutrition Calculator (`pages/nutrition-guide.html`)
- **Scientific Calculations**: Mifflin-St Jeor Equation for BMR
- **Activity Multipliers**: TDEE calculation with 5 activity levels
- **Macro Distribution**: Protein/carb/fat ratio optimization
- **Dietary Adaptation**: Meal plan adjustment for different diets
- **Allergy Filtering**: Basic allergen consideration in meal planning

#### 5. Responsive UI (`styles/style.css`)
- **CSS Custom Properties**: Consistent theming and easy maintenance
- **Media Queries**: Mobile-first responsive design
- **Glassmorphism**: Modern UI with backdrop blur effects
- **Animation System**: Smooth transitions and micro-interactions
- **Cross-Browser Compatibility**: Vendor prefixes and fallbacks

## 🎯 How to Use

### Getting Started
1. **Navigate to Main Dashboard**: The homepage provides access to all features
2. **Explore Workout Categories**: Use the dropdown menu to select specific body part workouts
3. **Access AI Features**: Click the chatbot icon or AI assistant for intelligent guidance

### AI Chatbot Usage
- **Open Chat**: Click the chatbot icon in the navigation bar
- **Ask Questions**: Type fitness-related queries in the input field
- **Get Responses**: Receive AI-powered advice about exercises, nutrition, and training
- **Refresh Chat**: Use the refresh button to clear conversation history
- **Close Chat**: Click the X icon to minimize the chat interface

### Voice Assistant Commands
- **Activate**: Click the AI assistant icon to start voice recognition
- **Navigation Commands**:
  - "Open chat" / "Close chat"
  - "Back" / "Chest" / "Biceps" / "Triceps" / "Shoulder" / "Leg"
  - "All Workout" / "Home"
- **General Commands**:
  - "Hello" / "Hey" (greeting)
  - "Who are you" (assistant introduction)
  - "Open YouTube/Google/Facebook/Instagram"
  - "Time" / "Date" (current time/date)
- **External Apps**: "Open calculator/WhatsApp"

### Personalized Workout Plans
1. **Enter Personal Information**: Age, gender, height, weight
2. **Set Fitness Goals**: Choose from weight loss, muscle gain, endurance, strength, or general fitness
3. **Specify Experience Level**: Beginner, intermediate, or advanced
4. **Define Schedule**: Available time and workout frequency
5. **Select Equipment**: Choose available gym equipment
6. **Note Limitations**: Mention any injuries or physical limitations
7. **Generate Plan**: Click the generate button for a custom workout routine
8. **Download/Regenerate**: Save your plan or create variations

### Nutrition Guide
1. **Input Personal Data**: Age, gender, height, weight
2. **Set Fitness Goal**: Weight loss, muscle gain, maintenance, or endurance
3. **Choose Activity Level**: From sedentary to very active
4. **Select Diet Preference**: Omnivore, vegetarian, vegan, keto, paleo, or mediterranean
5. **Note Allergies**: Specify any food allergies or restrictions
6. **Calculate**: Click to generate personalized nutrition plan
7. **Review Results**: See BMR, TDEE, target calories, and macro breakdown
8. **Get Meal Plan**: Receive customized meal suggestions for all meals

### Workout Pages
- **Browse Exercises**: View animated GIF demonstrations for each exercise
- **Navigate Categories**: Use the back button to return to main dashboard
- **Access Chat**: Use the integrated chatbot for exercise-specific questions

## 🔧 Development & Configuration

### API Configuration
The application uses Google's Gemini AI for the chatbot functionality:

1. **Get API Key**: Register at [Google AI Studio](https://aistudio.google.com/)
2. **Update Configuration**: Replace the API key in `script.js` (line 141):
   ```javascript
   let Api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY";
   ```
3. **Demo Mode**: The app includes fallback responses when API limits are reached

### Local Development Setup
1. **Clone Repository**:
   ```bash
   git clone https://github.com/madhanmohanreddyperam06/AI-Fitness-Trainer.git
   cd AI-Fitness-Trainer
   ```

2. **Start Local Server**:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Python 2
   python -m SimpleHTTPServer 8000

   # Using Node.js
   npx serve -p 8000

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in Browser**: Navigate to `http://localhost:8000`

### File Modifications
- **Custom Styling**: Modify `styles/style.css` for design changes
- **JavaScript Logic**: Update `script.js` for functionality changes
- **Content Updates**: Edit HTML files in `pages/` for content modifications
- **Asset Management**: Add/update GIFs and images in `assets/`

### Browser Compatibility
- **Chrome/Edge**: Full support for all features including Web Speech API
- **Firefox**: Full support except some Web Speech API limitations
- **Safari**: Full support with prefix considerations for some CSS features
- **Mobile Browsers**: Responsive design ensures good mobile experience

### Performance Considerations
- **Image Optimization**: GIF files are large; consider compression for production
- **API Rate Limits**: Gemini API has usage limits; demo mode handles this gracefully
- **Voice Recognition**: Requires HTTPS for production deployment (browser security)
- **Memory Management**: Large GIF files may impact mobile performance

## 🎨 Design System

### Color Palette
- **Primary**: Wheat accent color for highlights
- **Background**: Dark theme with glassmorphism effects
- **Chat Interface**: Semi-transparent backgrounds with blur effects
- **Gradients**: Used for buttons and interactive elements
- **Accessibility**: High contrast ratios for text readability

### Typography
- **Font Family**: Gill Sans, Gill Sans MT, Calibri, Trebuchet MS (system fonts)
- **Responsive Sizing**: Uses `clamp()` for fluid typography
- **Hierarchy**: Clear distinction between headings, body text, and labels
- **Weight**: Font weights range from 400 (regular) to 700 (bold)

### UI Components
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Modern input styling with focus states
- **Cards**: Glassmorphism effects with backdrop blur
- **Navigation**: Dropdown menus with smooth animations
- **Modals**: Dynamic modal system for additional content

## 🔒 Security & Privacy

### Data Handling
- **Client-Side Processing**: All calculations happen locally in the browser
- **No Server Storage**: No user data is stored or transmitted to servers
- **API Usage**: Only AI chatbot uses external API (Gemini)
- **Local Storage**: Application doesn't use persistent local storage

### Best Practices
- **API Key Security**: API key should be kept secure and not committed to public repositories
- **Input Validation**: Form inputs are validated before processing
- **XSS Prevention**: Dynamic content is handled safely
- **HTTPS Required**: Voice recognition features require HTTPS in production

## 🚀 Deployment Options

### Static Hosting
The application can be deployed to any static hosting service:
- **GitHub Pages**: Free hosting for public repositories
- **Netlify**: Easy deployment with continuous deployment
- **Vercel**: Optimized for frontend applications
- **AWS S3**: Scalable static file hosting
- **Firebase Hosting**: Google's static hosting solution

### Deployment Steps
1. **Build**: No build process required (pure HTML/CSS/JS)
2. **Configure API**: Ensure API key is properly configured
3. **Upload Files**: Deploy all files to hosting service
4. **Enable HTTPS**: Required for voice recognition features
5. **Test**: Verify all features work in production environment

### Environment Variables
For production deployment, consider:
- **API Key Management**: Use environment variables or server-side proxy
- **Domain Configuration**: Set up custom domain
- **SSL Certificate**: Enable HTTPS for voice features
- **CDN Configuration**: Use CDN for asset delivery

## 🤝 Contributing

### Development Guidelines
- **Code Style**: Follow existing code formatting and conventions
- **File Organization**: Maintain the current folder structure
- **Comments**: Add comments for complex logic (keep existing comments)
- **Testing**: Test features across different browsers and devices
- **Performance**: Consider performance implications of changes

### Feature Suggestions
Potential areas for enhancement:
- **User Authentication**: Add login/save functionality
- **Progress Tracking**: Implement workout history and progress charts
- **Social Features**: Add workout sharing and community features
- **Exercise Database**: Expand exercise library with more movements
- **Video Integration**: Replace GIFs with optimized video content
- **Offline Support**: Add PWA capabilities for offline usage
- **Multi-language**: Add internationalization support

## 📄 License

This project is open source under the [MIT License](LICENSE).

## 📞 Contact & Support

### Developer Information
**Madhan Mohan Reddy Peram**
- 📧 Email: [madhanmohanreddyperam06@gmail.com](mailto:madhanmohanreddyperam06@gmail.com)
- 📱 Mobile: [+91 9110395993](tel:+919110395993)

### Application Support
- **Support Email**: [support@fithub.com](mailto:support@fithub.com)
- **Support Phone**: +1 (234) 567-890
- **Social Media**: Facebook, Twitter, Instagram links in footer

### Legal & Policies
- **Privacy Policy**: Data handling and user privacy information
- **Terms of Service**: Usage terms and conditions
- **Cookie Policy**: Information about cookie usage
- **Accessibility**: Accessibility features and compliance
- **Sitemap**: Site structure and navigation map
- **FAQ**: Frequently asked questions and troubleshooting

---

🎉 Built with ❤️ for fitness enthusiasts
