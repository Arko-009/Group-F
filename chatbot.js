// DOM Elements
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; 
const inputInitHeight = chatInput.scrollHeight;

// API Configurations
const GEMINI_API_URL = 'https://gemini-pro-ai.p.rapidapi.com/';
const GEMINI_API_KEY = '2d15764a34msh0db2f2063a04b40p1dbb46jsnbe5197d6b3d6';

// Helper function to create chat message <li> elements
const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  const chatContent = className === "outgoing"
    ? `<p>${message}</p>` 
    : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
  chatLi.innerHTML = chatContent;
  return chatLi;
};

// Function to handle Gemini API requests
const callGeminiAPI = async (message) => {
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': GEMINI_API_KEY,
      'x-rapidapi-host': 'gemini-pro-ai.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ]
    })
  };

  try {
    const response = await fetch(GEMINI_API_URL, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Gemini API response:', data);
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error fetching Gemini API response.";
  }
};

// Function to handle API responses and display in chat
const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  try {
    const geminiResponse = await callGeminiAPI(userMessage);
    messageElement.textContent = `Gemini: ${geminiResponse}`;
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = `Error: ${error.message}`;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

// Handle sending chat messages
const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

// Event listeners
chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
