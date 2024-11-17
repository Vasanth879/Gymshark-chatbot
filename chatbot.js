
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input .send-btn");
const chatbox = document.querySelector(".chatbox");

let userMessage;
const API_KEY = "ENTER     YOUR    API       KEY"; // Replace with your actual API key

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    // Split className string and add classes individually
    className.split(' ').forEach(cls => chatLi.classList.add(cls));
    
    let chatContent = className.includes("outgoing") 
        ? `<p>${message}</p>` 
        : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
};

const generateResponse = async (userMessage) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            
            contents: [{
                parts: [{ text: userMessage }]
            }],
            safety_settings: {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
            },
            generation_config: {
                temperature: 0.9,
                topP: 0.1,
                topK: 16,
                maxOutputTokens: 2048,
            }
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API Response:", data);

        // Remove the "thinking..." message
        const thinkingMsg = document.querySelector(".chat.incoming.thinking");
        if (thinkingMsg) thinkingMsg.remove();

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
            const botResponse = data.candidates[0].content.parts[0].text;
            chatbox.appendChild(createChatLi(botResponse, "chat incoming"));
        } else {
            throw new Error("Unexpected API response format");
        }
    } catch (error) {
        console.error("Error details:", error);
        
        // Remove the "thinking..." message
        const thinkingMsg = document.querySelector(".chat.incoming.thinking");
        if (thinkingMsg) thinkingMsg.remove();

        // Show error message
        chatbox.appendChild(
            createChatLi("Sorry, I encountered an error. Please check your API key and try again.", "chat incoming")
        );
    }
    
    // Scroll to bottom
    chatbox.scrollTop = chatbox.scrollHeight;
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear input textarea
    chatInput.value = "";
    chatInput.style.height = "45px";

    // Append user message to chatbox
    chatbox.appendChild(createChatLi(userMessage, "chat outgoing"));
    chatbox.scrollTop = chatbox.scrollHeight;

    // Show "Thinking..." message
    setTimeout(() => {
        const thinkingMessage = createChatLi("Thinking...", "chat incoming thinking");
        chatbox.appendChild(thinkingMessage);
        chatbox.scrollTop = chatbox.scrollHeight;
        generateResponse(userMessage);
    }, 600);
};

// Auto-resize textarea
chatInput.addEventListener("input", () => {
    chatInput.style.height = "45px";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Event listeners
sendChatBtn.addEventListener("click", handleChat);

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});