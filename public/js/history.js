// history.js - Gestion de l'historique des conversations (bilingue)

let conversationHistory = {};

function addToHistory(contactPseudo, text, type, fromPseudo, toPseudo) {
    if (!conversationHistory[contactPseudo]) {
        conversationHistory[contactPseudo] = [];
    }
    conversationHistory[contactPseudo].push({
        text: text,
        type: type,
        from: fromPseudo,
        to: toPseudo,
        timestamp: new Date()
    });
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyDiv = document.getElementById('historyList');
    const t = window.chatT || { noConversation: "Aucune conversation" };
    if (!historyDiv) return;

    const contacts = Object.keys(conversationHistory);

    if (contacts.length === 0) {
        historyDiv.innerHTML = `<div class="empty-message" style="padding: 20px;">${t.noConversation}</div>`;
        return;
    }

    contacts.sort((a, b) => {
        const lastA = conversationHistory[a][conversationHistory[a].length - 1]?.timestamp || 0;
        const lastB = conversationHistory[b][conversationHistory[b].length - 1]?.timestamp || 0;
        return lastB - lastA;
    });

    historyDiv.innerHTML = '';

    contacts.forEach(contact => {
        const messages = conversationHistory[contact];
        if (!messages || messages.length === 0) return;

        const accordion = document.createElement('div');
        accordion.className = 'contact-accordion';

        const header = document.createElement('div');
        header.className = 'contact-header';
        header.innerHTML = `<span>💬 ${escapeHtml(contact)}</span><span class="badge">${messages.length}</span>`;

        const messagesDiv = document.createElement('div');
        messagesDiv.className = 'contact-messages';

        messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `history-message ${msg.type}`;
            const sender = msg.type === 'sent' ? `📤 Moi → ${escapeHtml(contact)}` : `✉️ ${escapeHtml(msg.from)}`;
            const timeStr = formatTime(msg.timestamp);
            msgDiv.innerHTML = `
                <div class="message-sender">${sender}</div>
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-time">${timeStr}</div>
            `;
            messagesDiv.appendChild(msgDiv);
        });

        header.onclick = () => messagesDiv.classList.toggle('open');
        accordion.appendChild(header);
        accordion.appendChild(messagesDiv);
        historyDiv.appendChild(accordion);
    });
}