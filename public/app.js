const socket = io();
let username = '';
let typingTimeout;
window.onload = async () => {
    try {
        // Server se login user ki detail mangne ke liye
        const response = await fetch('/api/user-info');
        const data = await response.json();

        if (data.email) {
            username = data.email;

            // UI Update: Loading hatao aur Chat dikhao
            document.getElementById('loading-status').style.display = 'none';
            document.getElementById('main-chat-area').style.display = 'block';

            // Socket ko join karne ka signal bhejo
            socket.emit('user join', username);
            console.log("Logged in as:", username);
        } else {
            // Agar session nahi hai toh login page par bhejo
            window.location.href = '/login-page';
        }
    } catch (err) {
        console.error("Auth Error:", err);
        window.location.href = '/login-page';
    }
};
function autoJoinChat(userEmail) {
    // Join UI hatane ke liye
    const joinSection = document.getElementById('join-section'); // Aapke HTML mein join wala div
    if (joinSection) joinSection.style.display = 'none';

    // Chat window dikhane ke liye
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) chatContainer.style.display = 'block';

    socket.emit('user join', userEmail);
    console.log("Joined as: " + userEmail);
}
function joinChat() {
    const usernameInput = document.getElementById('username');
    username = usernameInput.value.trim();
    if (!username) {
        alert('Please enter username');
        return;
    }
    socket.emit('user join', username);
    usernameInput.disabled = true;
}
function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('chat message', message);
    addMessage({
        user: 'You',
        text: message,
        time: new Date().toLocaleTimeString()
    }, 'sent');
    messageInput.value = '';
    socket.emit('stop typing');
}
function addMessage(data, type = 'received') {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.classList.add('message', type);
    div.innerHTML = `<strong>${data.user}</strong><br>
 ${data.text}<br>
 <small>${data.time}</small>
 `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
socket.on('chat message', (data) => {
    if (data.user === username) return;
    addMessage(data);
});
socket.on('message history', (messages) => {
    messages.forEach(msg => {
        addMessage(msg);
    });
});
socket.on('user joined', (data) => {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.classList.add('message', 'system');
    div.innerHTML = `${data.user} joined the chat`;
    messages.appendChild(div);
});
socket.on('user left', (data) => {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.classList.add('message', 'system');
    div.innerHTML = `${data.user} left the chat`;
    messages.appendChild(div);
});
function typingHandler() {
    socket.emit('typing');
    clearTimeout(typingTimeout); pingTimeout = setTimeout(() => {
        socket.emit('stop typing');
    }, 1000);
}
socket.on('user typing', (user) => {
    document.getElementById('typing-status').innerText = `${user} is typing...`;
});
socket.on('user stop typing', () => {
    document.getElementById('typing-status').innerText = '';
});
socket.on('error message', (msg) => {
    alert(msg);
});
socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
    setTimeout(() => {
        socket.connect();
    }, 5000);
});