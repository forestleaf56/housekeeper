const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const deleteButton = document.querySelector("#delete-btn");

// --- VERCEL CONFIGURATION ---
// Points to the serverless function (e.g., chat.js)
const API_URL = "/api/chat"; 

// THEME AVATARS
const HOUSEKEEPER_AVATAR = "https://media.giphy.com/media/l2JJEM9u76yD1sZBC/giphy.gif"; 
const USER_AVATAR = "https://media.giphy.com/media/3o6Zt6ML6Jjc0dgV56/giphy.gif"; 

// System Prompt
let conversation = JSON.parse(localStorage.getItem("conversation_home")) || [
    {
        role: "system",
        content: "Act as TidyUp, a professional, warm, and highly efficient home manager and housekeeper. You help the user organize their home, plan meals, create cleaning schedules, and remove stains. You are polite, encouraging, and practical. You love clean spaces and efficient routines. Your tone is like a helpful Mary Poppins or a smart home butler."
    }
];

const loadDataFromLocalstorage = () => {
    chatContainer.innerHTML = localStorage.getItem("all-chats-home") || 
    `<div class="default-text">
        <h1>Welcome Home!</h1>
        <p>I'm your personal Home Manager.<br>Need a meal plan? A cleaning tip?<br>Or just help organizing the closet?</p>
     </div>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;
};

const createChatElement = (content, className) => {
    const div = document.createElement("div");
    div.classList.add("chat", className);
    div.innerHTML = content;
    return div;
};

const saveConversation = () => {
    localStorage.setItem("conversation_home", JSON.stringify(conversation));
};

const getChatResponse = async (incomingChatDiv) => {
    const p = document.createElement("p");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // We only send messages; the backend handles the model & key
            body: JSON.stringify({
                messages: conversation
            })
        });

        if (!response.ok) {
            throw new Error("Server communication failed.");
        }

        const data = await response.json();
        
        if(data.error) {
            throw new Error(data.error.message);
        }

        const reply = data.choices[0].message.content.trim();

        conversation.push({ role: "assistant", content: reply });
        saveConversation();

        p.textContent = reply;
    } catch (err) {
        p.textContent = "Household Error: " + err.message;
        p.classList.add("error");
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(p);
    localStorage.setItem("all-chats-home", chatContainer.innerHTML);
    chatContainer.scrollTop = chatContainer.scrollHeight;
};

const showTypingAnimation = () => {
    const html = `
        <div class="chat-content">
            <span class="timestamp">Home Manager:</span>
            <div class="chat-details">
                <div class="avatar-box"><img src="${HOUSEKEEPER_AVATAR}"></div>
                <div class="typing-animation">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>`;
    const div = createChatElement(html, "incoming");
    chatContainer.appendChild(div);
    getChatResponse(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
};

const handleOutgoingChat = () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = "";

    conversation.push({ role: "user", content: text });
    saveConversation();

    const html = `
        <div class="chat-content">
             <span class="timestamp" style="text-align:right;">Homeowner:</span>
            <div class="chat-details" style="flex-direction:row-reverse;">
                <div class="avatar-box"><img src="${USER_AVATAR}"></div>
                <p>${text}</p>
            </div>
        </div>`;

    // Remove default welcome text
    const defaultText = chatContainer.querySelector(".default-text");
    if (defaultText) defaultText.remove();

    chatContainer.appendChild(createChatElement(html, "outgoing"));
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(showTypingAnimation, 600);
};

deleteButton.addEventListener("click", () => {
    if (!confirm("Start a fresh slate? This will clear your household notes.")) return;
    localStorage.removeItem("conversation_home");
    localStorage.removeItem("all-chats-home");
    conversation = [
        {
            role: "system",
            content: "Act as TidyUp, a professional, warm, and highly efficient home manager and housekeeper. You help the user organize their home, plan meals, create cleaning schedules, and remove stains. You are polite, encouraging, and practical."
        }
    ];
    chatContainer.innerHTML = "";
    loadDataFromLocalstorage();
});

chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

sendButton.addEventListener("click", handleOutgoingChat);

loadDataFromLocalstorage();
