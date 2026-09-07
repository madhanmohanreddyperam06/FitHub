# FitHub — AI-Powered Fitness Ecosystem 🏋️‍♂️⚡

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini%202.0-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg?style=for-the-badge)](LICENSE)

A high-performance, client-side fitness platform featuring real-time computer vision pose tracking, Google Gemini AI fitness coaching, interactive biometric dashboards, algorithm-driven workout generation, and scientific nutrition planning.

---

## ⚡ Highlights

- **Zero Build Dependencies**: Runs directly in the browser via native ES6+ JavaScript, HTML5, and CSS3.
- **Pure Black UI/UX**: Ultra-clean `#000000` dark theme with high-contrast `#ffffff` typography and subtle hairline accents.
- **2-Tier Card Architecture**: Systematic, clutter-free layouts using single outer and inner card containers (`.fithub-card-outer` + `.fithub-card-inner`).
- **Real-Time Computer Vision**: Client-side pose estimation and repetition tracking powered by TensorFlow.js MoveNet.
- **AI Intelligence with Offline Fallback**: Google Gemini 2.0 Flash integration with instant offline demo mode when API keys or quotas are limited.
- **Mobile-First Dock Navigation**: Persistent bottom floating dock with clean SVG iconography (`fa-regular` series).

---

## 🎯 Core Features

### 1. ⚡ Live Training Command Center (`public/index.html`)
- **Daily Activity Rings**: Real-time interactive SVG progress rings tracking Movement, Hydration (cups), and Energy expenditure (kcal) with instant increment buttons.
- **Biometric & Metabolic Projector**: Draggable weight and height sliders with real-time BMI categorization, recommended water intake calculation, and maintenance calorie estimates.
- **Weekly Habit Streak**: Interactive 7-day visual tracker and daily push-up challenge progress bar.

### 2. 📷 AI Pose Trainer (`src/ai-features/ai.html`)
- **MoveNet Skeleton Tracking**: 17-point anatomical landmark detection running locally at 30+ FPS via TensorFlow.js.
- **Real-Time Rep Counting**: Automated angle calculation across key joints for Squats, Push-Ups, Jumping Jacks, and Crunches.
- **Live Form Feedback**: Visual color-coded alerts (`Correct Form`, `Go Lower`, `Push Higher`) with real-time accuracy scoring.
- **Webcam Simulation Mode**: Built-in test environment to preview detection algorithms without requiring a live camera feed.

### 3. 🤖 AI Fitness Coach — "Chitti" (`public/js/script.js`)
- **Gemini 2.0 Flash Engine**: Instant context-aware responses covering workout programming, injury prevention, and meal prep.
- **Instant Suggestion Chips**: One-tap query pills for common fitness topics.
- **Offline Demo Mode**: Intelligent rule-based fallback responses ensuring 100% uptime even without an active API key or internet connection.
- **Session Management**: Live typing indicators, conversation clearing, and markdown rendering.

### 4. 📋 Personalized Workout Generator (`public/pages/personalized-plans.html`)
- **Custom Routine Engineering**: Generates multi-week programs tailored by age, gender, biometrics, target goals, schedule frequency, and equipment.
- **Biometrics Ribbon**: Single flattened metrics bar summarizing BMI, target calorie expenditure, hydration, and training frequency.
- **Clean Exercise Rows**: Unboxed, divider-separated exercise breakdowns with sets, reps, rest periods, and execution cues.
- **Export Capabilities**: One-click PDF / text export and instant plan regeneration.

### 5. 🥗 Scientific Nutrition Guide (`public/pages/nutrition-guide.html`)
- **Metabolic Engine**: Accurate BMR (Mifflin-St Jeor) and TDEE calculation across 5 physical activity tiers.
- **Dynamic Macro Distribution**: Visual breakdown of Protein, Carbohydrates, and Fats tailored for Fat Loss, Maintenance, or Hypertrophy.
- **Day-by-Day Meal Blueprint**: Interactive Monday–Sunday tabs displaying 4 daily meals (Breakfast, Lunch, Snack, Dinner) with one-click meal swapping.
- **Dietary Preferences**: Full support for Omnivore, Vegetarian, Vegan, Keto, Paleo, and Mediterranean diets with allergy filtering.

### 6. 🏋️ Animated Exercise Library (`public/pages/workout.html`)
- **Comprehensive Library**: 30+ exercises across 5 muscle groups (Chest, Back, Arms, Shoulders, Legs).
- **Animated GIF Demonstrations**: Real-time visual form demonstrations for every exercise.
- **Instant Search & Filter**: Dynamic client-side filtering by muscle group and movement name.
- **Rest Countdown Timer**: Circular modal stopwatch with audio cues and pause/resume functionality.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | HTML5 (Semantic), CSS3 (Modern Flexbox, CSS Grid, Custom Properties), Vanilla JavaScript (ES6+) |
| **Machine Learning** | TensorFlow.js, MoveNet SinglePose Lightning Model |
| **Generative AI** | Google Gemini 2.0 Flash REST API |
| **Icons & Media** | FontAwesome 6 (Regular SVG Icons), Optimized GIF animations |
| **Audio** | Web Audio API (Synthesized feedback beeps and chimes) |
| **Storage** | Browser `localStorage` (Offline state & biometrics persistence) |

---

## 📁 Directory Structure

```text
AI-Powered Fitness Trainer/
├── public/
│   ├── index.html                    # Main dashboard & Live Command Center
│   ├── css/
│   │   └── style.css                 # Master stylesheet (Pure Black theme, 2-tier cards)
│   ├── js/
│   │   └── script.js                 # App state, Command Center, Gemini chatbot, timer
│   ├── pages/
│   │   ├── workout.html              # Exercise library compilation
│   │   ├── chest.html                # Chest exercises with animated GIFs
│   │   ├── back.html                 # Back exercises with animated GIFs
│   │   ├── biceps-triceps.html       # Arms exercises with animated GIFs
│   │   ├── shoulder.html             # Shoulder exercises with animated GIFs
│   │   ├── leg.html                  # Leg exercises with animated GIFs
│   │   ├── personalized-plans.html   # AI personalized workout plan generator
│   │   └── nutrition-guide.html      # Nutrition calculator & weekly meal planner
│   └── assets/
│       ├── animations/workouts/      # 30+ exercise demonstration GIFs
│       ├── backgrounds/              # Background imagery
│       └── icons/                    # App icons & favicons
├── src/
│   └── ai-features/
│       ├── ai.html                   # AI Pose Trainer interface
│       ├── ai-style.css              # Pose trainer UI stylesheet
│       ├── pose.js                   # TensorFlow.js MoveNet tracking & rep counter
│       ├── chatbot.js                # Chatbot interface helper
│       └── voice.js                  # Speech recognition module (deferred)
├── LICENSE                           # MIT License
└── README.md                         # Project documentation
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/madhanmohanreddyperam06/FitHub.git
cd FitHub
```

### 2. Launch Local Server
Because the application uses standard client-side web technologies and camera APIs, serve it with any local HTTP server:

```bash
# Option A: Python 3
python -m http.server 8000

# Option B: Node.js (npx)
npx serve public -p 8000

# Option C: VS Code
# Install the "Live Server" extension, right-click public/index.html, and click "Open with Live Server".
```

### 3. Open in Browser
Navigate to `http://localhost:8000/public/index.html` (or `http://localhost:8000`).

---

## ⚙️ Configuration (Optional)

### Google Gemini API Key
The AI chatbot works out-of-the-box using the built-in offline demo responses. To connect your live Google Gemini API key:

1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open `public/js/script.js`.
3. Locate `Api_url` inside `FitHubChat.sendMessage()` and supply your key:
   ```javascript
   const Api_url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${YOUR_API_KEY}`;
   ```

---

## 🎨 Design Guidelines

- **Palette**: `#000000` (Background), `#08080a` (Outer Card), `#111115` (Inner Card), `#ffffff` (Headings & Accents), `#a1a1aa` (Body Text), `rgba(255, 255, 255, 0.12)` (Borders).
- **Card Rule**: Maximum 2 nesting layers (`.fithub-card-outer` > `.fithub-card-inner`). Never place cards within inner cards; use list rows with hairline dividers instead.
- **Form Controls**: Pure black background (`#000000 !important`), white text, crisp 1px borders, and custom SVG chevron dropdown indicators across all inputs and select menus.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Madhan Mohan Reddy Peram**  
- 📧 Email: [madhanmohanreddyperam06@gmail.com](mailto:madhanmohanreddyperam06@gmail.com)  
- 📱 Phone: [+91 9110395993](tel:+919110395993)  
- 🌐 GitHub: [@madhanmohanreddyperam06](https://github.com/madhanmohanreddyperam06)
