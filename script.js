// Detect if we're on the main page and add appropriate class
document.addEventListener('DOMContentLoaded', function() {
    // Check if current page is index.html (main page)
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        document.body.classList.add('index-page');
        console.log('Main page detected - showing voice assistant and chatbot');
    } else {
        console.log('Subpage detected - hiding voice assistant and chatbot');
    }
});

let select = document.querySelector(".select-heading");
let arrow = document.querySelector(".select-heading img");
let options = document.querySelector(".options");
let optionItems = document.querySelectorAll(".option");
let selectText = document.querySelector(".select-heading span");
let selectBox = document.querySelector(".select-box");

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!selectBox.contains(e.target)) {
        options.classList.remove("active-options");
        arrow.classList.remove("rotate");
        selectBox.classList.remove("active");
    }
});

// Toggle dropdown
select.addEventListener("click", (e) => {
    e.stopPropagation();
    options.classList.toggle("active-options");
    arrow.classList.toggle("rotate");
    selectBox.classList.toggle("active");
});

// Handle option selection
optionItems.forEach((item) => {
    item.addEventListener("click", (e) => {
        e.stopPropagation();
        selectText.innerText = item.innerText;
        options.classList.remove("active-options");
        arrow.classList.remove("rotate");
        selectBox.classList.remove("active");
    });
});

// Prevent closing when clicking inside options
options.addEventListener("click", (e) => {
    e.stopPropagation();
});

// chat bot

let prompt = document.querySelector(".prompt");
let chatbtn = document.querySelector(".send-btn");
let chatContainer = document.querySelector(".chat-container");
let h1 = document.querySelector(".h1");
let chatimg = document.querySelector("#chatbotimg");
let chatbox = document.querySelector(".chat-box");
let refreshBtn = document.querySelector("#refreshChat");

let userMessage = "";

// Refresh chat functionality
refreshBtn.addEventListener("click", () => {
    // Clear all chat messages
    chatContainer.innerHTML = "";
    
    // Show the header again
    h1.style.display = "block";
    
    // Clear the input field
    prompt.value = "";
    
    // Add visual feedback
    refreshBtn.style.transform = "rotate(360deg)";
    setTimeout(() => {
        refreshBtn.style.transform = "";
    }, 300);
});

chatimg.addEventListener("click", () => {
    chatbox.classList.toggle("active-chat-box");
    if (chatbox.classList.contains("active-chat-box")) {
        // Clear chat when opening
        chatContainer.innerHTML = "";
        h1.style.display = "block";
        prompt.value = "";
        chatimg.src = "assets/cross.svg";
    } else {
        chatimg.src = "assets/chatbot.svg";
    }
});

let Api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCxqXGU7udc-l-PHmqZ42v7pSGnCbKOTfA";

async function generateApiResponse(aiChatBox) {
    const textElement = aiChatBox.querySelector(".text");
    console.log("Generating API response for:", userMessage);
    
    // Demo mode responses for testing when API is limited
    const demoResponses = {
        "hello": "Hi! I'm Chitti, your fitness assistant! How can I help you today?",
        "hi": "Hello! I'm here to help with your fitness journey. What would you like to know?",
        "exercise": "Great question! Some basic exercises include push-ups, squats, and planks. What area are you focusing on?",
        "weight": "For weight loss, combine cardio exercises with strength training and a balanced diet. Would you like specific workout suggestions?",
        "chest": "Chest exercises: push-ups, bench press, dumbbell flyes, and chest dips. Start with 3 sets of 10-12 reps!",
        "back": "Back workouts: pull-ups, rows, deadlifts, and lat pulldowns. Remember to maintain proper form!",
        "default": "I'm your fitness assistant! I can help with workout plans, exercise techniques, and fitness advice. What specific topic would you like to discuss?"
    };
    
    // Check if message contains keywords for demo responses
    let lowerMessage = userMessage.toLowerCase();
    let demoResponse = demoResponses.default;
    
    for (let keyword in demoResponses) {
        if (lowerMessage.includes(keyword)) {
            demoResponse = demoResponses[keyword];
            break;
        }
    }
    
    // Try API first, fallback to demo if rate limited
    try {
        const requestBody = JSON.stringify({
            contents: [{
                "role": "user",
                "parts": [{text: userMessage}]
            }]
        });
        
        console.log("Request body:", requestBody);
        
        const response = await fetch(Api_url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: requestBody
        });
        
        console.log("API Response status:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log("Error response body:", errorText);
            
            // If rate limited, use demo response
            if (response.status === 429) {
                textElement.innerText = demoResponse + " (Demo mode - API rate limited)";
                console.log("Using demo response due to rate limit");
                aiChatBox.querySelector(".loading").style.display = "none";
                return;
            }
            
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("API Response data:", data);
        
        let apiResponse = null;
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            apiResponse = data.candidates[0].content.parts[0].text.trim();
        } else if (data.error) {
            throw new Error(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
        } else {
            console.log("Unexpected response format:", data);
            apiResponse = "I received a response but couldn't understand it.";
        }
        
        if (apiResponse) {
            textElement.innerText = apiResponse;
            console.log("Response set:", apiResponse);
        } else {
            textElement.innerText = demoResponse;
            console.log("Using demo response - no valid API response");
        }

    }
    catch (error) {
        console.log("Full API Error:", error);
        textElement.innerText = demoResponse + " (Demo mode - " + error.message + ")";
    }
    finally {
        aiChatBox.querySelector(".loading").style.display = "none";
    }
}

function createChatBox(html, className) {
    const div = document.createElement("div");
    div.classList.add(className);
    div.innerHTML = html;
    return div;
}

function showLoading() {
    const html = `<div class="message-label">CHITTI</div><p class="text"></p>
        <img src="assets/load.gif" class="loading" width="50px">`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateApiResponse(aiChatBox);
}

chatbtn.addEventListener("click", () => {
    console.log("Send button clicked!");
    console.log("User message:", prompt.value);
    
    if (!prompt.value.trim()) {
        console.log("Empty message - not sending");
        return;
    }
    
    h1.style.display = "none";
    userMessage = prompt.value;
    console.log("Processing message:", userMessage);
    
    const html = `<div class="message-label">YOU</div><p class="text"></p>`;
    let userChatBox = createChatBox(html, "user-chat-box");
    userChatBox.querySelector(".text").innerText = userMessage;
    chatContainer.appendChild(userChatBox);
    prompt.value = "";
    setTimeout(showLoading, 500);
});

// Also add Enter key support
prompt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        console.log("Enter key pressed");
        chatbtn.click();
    }
});

// virtual assistant

let ai = document.querySelector(".virtual-assistant img");
let speakpage = document.querySelector(".speak-page");
let content = document.querySelector(".speak-page h1");

function speak(text) {
    let text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.pitch = 1;
    text_speak.volume = 1;
    text_speak.lang = "hi-GB";
    window.speechSynthesis.speak(text_speak);
}

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onresult = (event) => {
    speakpage.style.display = "none";
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript;
    content.innerText = transcript;
    takeCommand(transcript.toLowerCase());
};

function takeCommand(message) {
    if (message.includes("open") && message.includes("chat")) {
        speak("okay sir");
        chatbox.classList.add("active-chat-box");
    } else if (message.includes("close") && message.includes("chat")) {
        speak("okay sir");
        chatbox.classList.remove("active-chat-box");
    } else if (message.includes("back")) {
        speak("okay sir");
        window.open("back.html", "_self");
    } else if (message.includes("chest")) {
        speak("okay sir");
        window.open("chest.html", "_self");
    } else if (message.includes("biceps") || message.includes("triceps")) {
        speak("okay sir");
        window.open("biceps-triceps.html", "_self");
    } else if (message.includes("shoulder")) {
        speak("okay sir");
        window.open("shoulder.html", "_self");
    } else if (message.includes("leg")) {
        speak("okay sir");
        window.open("leg.html", "_self");
    } else if (message.includes("All Workout")) {
        speak("okay sir");
        window.open("workout.html", "_self");
    } else if (message.includes("home")) {
        speak("okay sir");
        window.open("index.html", "_self");
    } else if (message.includes("hello") || message.includes("hey")) {
        speak("hello sir,what can i help you?");
    } else if (message.includes("who are you")) {
        speak("i am virtual assistant, created by Madhan Mohan Reddy Sir");
    } else if (message.includes("open youtube")) {
        speak("opening youtube...");
        window.open("https://youtube.com/", "_blank");
    } else if (message.includes("open google")) {
        speak("opening google...");
        window.open("https://google.com/", "_blank");
    } else if (message.includes("open facebook")) {
        speak("opening facebook...");
        window.open("https://facebook.com/", "_blank");
    } else if (message.includes("open insatgram")) {
        speak("opening google...");
        window.open("https://instagram.com/", "_blank");
    } else if (message.includes("open calculator")) {
        speak("opening calculator...");
        window.open("calculator://");
    } else if (message.includes("open whatsapp")) {
        speak("opening whatsapp...");
        window.open("whatsapp://");
    } else if (message.includes("time")) {
        let time = new Date().toLocaleString(undefined, {hour: "numeric", minute: "numeric"});
        speak("time");
    } else if (message.includes("date")) {
        let time = new Date().toLocaleString(undefined, {day: "numeric", month: "short"});
        speak("date");
    } else {
        let finalText = "this is what i finally found on internet regarding" + message.replace("shipra", "") || message.replace("shifra", "")
        speak(finalText);
        window.open(`https://www.google.com/search?q=${message.replace("shipra", "")}`,"_blank");
    }
}

ai.addEventListener("click", () => {
    recognition.start();
    speakpage.style.display = "flex";
});

// Footer Feature Functions
function openChat() {
    const chatbox = document.querySelector(".chat-box");
    const chatimg = document.querySelector("#chatbotimg");
    
    if (chatbox && chatimg) {
        chatbox.classList.add("active-chat-box");
        chatimg.src = "assets/cross.svg";
        
        // Clear chat when opening
        const chatContainer = document.querySelector(".chat-container");
        const h1 = document.querySelector(".chat-box .h1");
        if (chatContainer && h1) {
            chatContainer.innerHTML = "";
            h1.style.display = "block";
        }
        
        // Scroll to chat if needed
        chatbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return false; // Prevent default link behavior
}

function openVoiceAssistant() {
    const ai = document.querySelector(".virtual-assistant img");
    const speakpage = document.querySelector(".speak-page");
    
    if (ai && speakpage) {
        ai.click(); // Trigger existing voice assistant functionality
    }
    
    return false; // Prevent default link behavior
}

// Social Media Functions
function openFacebook() {
    window.open("https://www.facebook.com/fithub", "_blank");
    return false;
}

function openTwitter() {
    window.open("https://www.twitter.com/fithub", "_blank");
    return false;
}

function openInstagram() {
    window.open("https://www.instagram.com/fithub", "_blank");
    return false;
}

// Feature Functions
function openPersonalizedPlans() {
    // Create a modal or navigate to plans page
    showFeatureModal("Personalized Plans", "Get customized workout plans tailored to your fitness goals, experience level, and schedule. Our AI will create the perfect plan for you!");
    return false;
}

function openNutritionGuide() {
    showFeatureModal("Nutrition Guide", "Comprehensive nutrition advice including meal plans, supplement guidance, and dietary recommendations to support your fitness journey.");
    return false;
}

function openProgressTracking() {
    showFeatureModal("Progress Tracking", "Track your workouts, monitor your progress, set goals, and celebrate achievements with our advanced tracking system.");
    return false;
}

function openExerciseLibrary() {
    showFeatureModal("Exercise Library", "Access our complete library of exercises with detailed instructions, video demonstrations, and proper form guidance.");
    return false;
}

// Contact Functions
function sendEmail() {
    window.open("mailto:support@fithub.com?subject=FitHub Support Request&body=Hello FitHub Team,", "_blank");
    return false;
}

function makePhoneCall() {
    window.open("tel:+1234567890", "_blank");
    return false;
}

// Legal Pages
function openPrivacyPolicy() {
    showLegalPage("Privacy Policy", "Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.");
    return false;
}

function openTermsOfService() {
    showLegalPage("Terms of Service", "Terms and conditions for using FitHub services, including user responsibilities and service limitations.");
    return false;
}

function openCookiePolicy() {
    showLegalPage("Cookie Policy", "Information about how we use cookies and similar technologies to enhance your experience.");
    return false;
}

// Utility Functions
function showFeatureModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("featureModal");
    if (!modal) {
        modal = createModal();
    }
    
    // Update modal content
    const modalTitle = modal.querySelector(".modal-title");
    const modalContent = modal.querySelector(".modal-content");
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = `
        <p>${content}</p>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="closeModal()">Get Started</button>
            <button class="btn btn-secondary" onclick="closeModal()">Learn More</button>
        </div>
    `;
    
    // Show modal
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function showLegalPage(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById("featureModal");
    if (!modal) {
        modal = createModal();
    }
    
    // Update modal content
    const modalTitle = modal.querySelector(".modal-title");
    const modalContent = modal.querySelector(".modal-content");
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = `
        <div class="legal-content">
            <p>${content}</p>
            <div class="legal-sections">
                <h4>Key Points:</h4>
                <ul>
                    <li>We respect your privacy and data security</li>
                    <li>Your information is used to improve our services</li>
                    <li>You have control over your personal data</li>
                    <li>We comply with applicable data protection laws</li>
                </ul>
            </div>
        </div>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="closeModal()">I Understand</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    // Show modal
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function createModal() {
    const modal = document.createElement("div");
    modal.id = "featureModal";
    modal.className = "modal";
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">Feature Title</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-content">
                    <!-- Content will be dynamically inserted -->
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.8);
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }
        
        .modal-container {
            position: relative;
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            border-radius: 12px 12px 0 0;
        }
        
        .modal-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: white;
            padding: 5px;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease;
        }
        
        .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-content p {
            margin-bottom: 20px;
            line-height: 1.6;
            color: #333;
        }
        
        .legal-sections {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .legal-sections h4 {
            margin-bottom: 10px;
            color: #1a1a1a;
        }
        
        .legal-sections ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .legal-sections li {
            margin-bottom: 8px;
            color: #555;
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
        }
        
        .btn-secondary {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #dee2e6;
        }
        
        .btn-secondary:hover {
            background: #e9ecef;
        }
    `;
    
    // Add styles to head
    const styleSheet = document.createElement("style");
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    return modal;
}

function closeModal() {
    const modal = document.getElementById("featureModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

// Additional Footer Functions
function openAccessibility() {
    showFeatureModal("Accessibility", "FitHub is committed to making our fitness platform accessible to everyone. We offer features like screen reader support, keyboard navigation, and adjustable text sizes.");
    return false;
}

function openSitemap() {
    showFeatureModal("Sitemap", "Complete site map of FitHub including all workout pages, features, and resources to help you navigate our platform easily.");
    return false;
}

function openFAQ() {
    showFeatureModal("Frequently Asked Questions", "Find answers to common questions about FitHub features, workout plans, AI assistance, and technical support.");
    return false;
}

// Auto-initialize footer links when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to footer links that have onclick attributes
    const footerLinks = document.querySelectorAll('.footer-links a[onclick], .footer-bottom-links a[onclick]');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
});













