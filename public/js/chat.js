// Logique principale du chat

const socket = io();
const user = JSON.parse(localStorage.getItem('chatUser'));

// Éléments DOM
const usersDiv = document.getElementById('usersList');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const envelope = document.getElementById('envelope');

// Variables d'état
let currentTarget = null;
let currentTargetName = null;
let pendingMessages = [];
let usersList = [];

// Afficher le pseudo dans le header
const userBadge = document.getElementById('userBadge');
if (userBadge) {
    userBadge.innerHTML = `👤 ${escapeHtml(user.pseudo)} | ${user.age} ans`;
}

// Initialiser l'utilisateur sur le serveur
socket.emit('user join', user);

// --------------------------------------------------------------
// GESTION DE LA LISTE DES CONNECTÉS
// --------------------------------------------------------------
socket.on('update users', (usersListData) => {
    usersList = usersListData;
    
    if (usersList.length === 0) {
        usersDiv.innerHTML = '<em>Aucun connecté</em>';
        return;
    }
    
    usersDiv.innerHTML = '';
    
    usersList.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-item';
        const orientationSymbol = getOrientationSymbol(u.tendencies);
        
        if (u.socketId === socket.id) {
            div.innerHTML = `<strong>${escapeHtml(u.pseudo)} (moi)</strong> <span style="font-size:12px;">(${u.age} ans, ${orientationSymbol} ${u.locationName || u.locationCode})</span>`;
            div.style.background = '#e9ecef';
            div.style.fontStyle = 'italic';
        } else {
            div.innerHTML = `<strong>${escapeHtml(u.pseudo)}</strong> <span style="font-size:12px;">(${u.age} ans, ${orientationSymbol} ${u.locationName || u.locationCode})</span>`;
            div.onclick = () => {
                document.querySelectorAll('.user-item').forEach(el => el.classList.remove('current-target'));
                div.classList.add('current-target');
                
                currentTarget = u.socketId;
                currentTargetName = u.pseudo;
                messageInput.disabled = false;
                sendBtn.disabled = false;
                messageInput.placeholder = `Message pour ${u.pseudo}...`;
                messageInput.focus();
                clearMessageArea();
                
                showContactInfo(u.pseudo, u.age, u.gender, u.tendencies, u.locationName || u.locationCode, u.purpose, u.bio || t.noBio);
            };
        }
        usersDiv.appendChild(div);
    });
});

// --------------------------------------------------------------
// ENVOI ET RÉCEPTION DES MESSAGES
// --------------------------------------------------------------
socket.on('message sent confirmation', (data) => {
    displayMessage(data.message, 'sent', null, currentTargetName);
    addToHistory(currentTargetName, data.message, 'sent', user.pseudo, currentTargetName);
    messageInput.value = '';
    messageInput.focus();
});

socket.on('private message received', (data) => {
    pendingMessages.push(data);
    updateEnvelope(pendingMessages.length);
    startBlinking();
});

socket.on('error', (msg) => {
    console.error('Erreur:', msg);
});

// --------------------------------------------------------------
// ENVELOPPE (messages reçus)
// --------------------------------------------------------------
envelope.onclick = () => {
    if (pendingMessages.length === 0) return;
    
    const msg = pendingMessages.shift();
    displayMessage(msg.message, 'received', msg.fromPseudo);
    addToHistory(msg.fromPseudo, msg.message, 'received', msg.fromPseudo, user.pseudo);
    
    // Auto-sélection pour répondre
    currentTarget = msg.fromSocketId;
    currentTargetName = msg.fromPseudo;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.placeholder = `Répondre à ${msg.fromPseudo}...`;
    messageInput.focus();
    
    // Surligner dans la liste des connectés
    document.querySelectorAll('.user-item').forEach(el => {
        if (el.textContent.includes(msg.fromPseudo) && !el.textContent.includes('(moi)')) {
            document.querySelectorAll('.user-item').forEach(e => e.classList.remove('current-target'));
            el.classList.add('current-target');
        }
    });
    
    // Afficher la bio de l'expéditeur (en conservant la vraie bio)
    const senderInfo = usersList.find(u => u.pseudo === msg.fromPseudo);
    console.log("senderInfo:", senderInfo);
    console.log("Bio reçue:", senderInfo?.bio);
    if (senderInfo) {
        // Utiliser la bio existante si elle n'est pas vide
        let bioText = senderInfo.bio;
        if (!bioText || bioText === "Aucune présentation" || bioText === "") {
            bioText = "Pas de présentation";
        }
        showContactInfo(
            senderInfo.pseudo,
            senderInfo.age,
            senderInfo.tendencies,
            senderInfo.locationName || senderInfo.locationCode,
            bioText
        );
    } else {
        showContactInfo(msg.fromPseudo, '?', '', '?', 'Bio non disponible');
    }
    
    updateEnvelope(pendingMessages.length);
    if (pendingMessages.length === 0) {
        stopBlinking();
    }
};

// --------------------------------------------------------------
// ENVOI DE MESSAGE
// --------------------------------------------------------------
sendBtn.onclick = () => {
    const text = messageInput.value.trim();
    if (!text || !currentTarget) return;
    
    if (currentReceivedMessage !== null) {
        clearMessageArea();
    }
    
    socket.emit('private message', {
        toSocketId: currentTarget,
        message: text,
        fromPseudo: user.pseudo
    });
};

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();

    // ========== CHAT PRIVÉ (POPUP DISCÈTE EN BAS) ==========

    // Stockage des messages échangés pour le seuil
    let privateChatAvailable = {};

    // Écouter le serveur pour savoir quand le seuil est atteint
    socket.on('privateChatAvailable', (data) => {
        console.log(`🔔 Seuil atteint avec ${data.with}`);
        privateChatAvailable[data.with] = true;

        // Afficher la popup discrète
        showPrivatePopup(data.with);
    });

    // Popup discrète en bas de l'écran (NE BLOQUE PAS L'ENVELOPPE)
    // Popup discrète (reste jusqu'au clic)
    function showPrivatePopup(pseudo) {
        if (document.getElementById('privatePopup')) return;

        const chatPanel = document.querySelector('.chat-panel');
        if (!chatPanel) return;

        // S'assurer que chatPanel est en relative
        if (getComputedStyle(chatPanel).position !== 'relative') {
            chatPanel.style.position = 'relative';
        }

        // Trouver l'input-area
        const inputArea = document.querySelector('.input-area');
        if (!inputArea) return;

        // Calculer la position sous l'input
        const inputRect = inputArea.getBoundingClientRect();
        const chatRect = chatPanel.getBoundingClientRect();
        const topPosition = inputRect.bottom - chatRect.top;

        const popup = document.createElement('div');
        popup.id = 'privatePopup';
        popup.style.cssText = `
        position: absolute;
        top: ${topPosition + 5}px;
        left: 0;
        right: 0;
        background: #2c3e50;
        color: white;
        border-radius: 8px;
        padding: 10px 12px;
        z-index: 1000;
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.2s ease, transform 0.2s ease;
    `;

        popup.innerHTML = `
        <span>💬 <strong>${pseudo}</strong> : 3 messages échangés. Passer en privé ?</span>
        <div style="display: flex; gap: 6px;">
            <button id="popupAccept" style="background:#27ae60; color:white; border:none; border-radius:4px; padding:4px 10px; cursor:pointer;">✅ Oui</button>
            <button id="popupDecline" style="background:#e74c3c; color:white; border:none; border-radius:4px; padding:4px 10px; cursor:pointer;">❌ Non</button>
        </div>
    `;

        chatPanel.appendChild(popup);

        // Animation d'apparition
        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0)';
        }, 10);

        document.getElementById('popupAccept').onclick = () => {
            socket.emit('invitePrivate', { toPseudo: pseudo, fromPseudo: user.pseudo });
            popup.remove();
        };

        document.getElementById('popupDecline').onclick = () => {
            popup.remove();
        };
    }

    // Recevoir une invitation
    socket.on('privateInviteReceived', (data) => {
        if (document.getElementById('invitePopup')) return;

        const chatPanel = document.querySelector('.chat-panel');
        if (!chatPanel) return;

        if (getComputedStyle(chatPanel).position !== 'relative') {
            chatPanel.style.position = 'relative';
        }

        const inputArea = document.querySelector('.input-area');
        if (!inputArea) return;

        const inputRect = inputArea.getBoundingClientRect();
        const chatRect = chatPanel.getBoundingClientRect();
        const topPosition = inputRect.bottom - chatRect.top;

        const popup = document.createElement('div');
        popup.id = 'invitePopup';
        popup.style.cssText = `
        position: absolute;
        top: ${topPosition + 5}px;
        left: 0;
        right: 0;
        background: #2c3e50;
        color: white;
        border-radius: 8px;
        padding: 10px 12px;
        z-index: 1000;
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.2s ease, transform 0.2s ease;
    `;

        popup.innerHTML = `
        <span>🔔 <strong>${data.from}</strong> vous invite en chat privé.</span>
        <div style="display: flex; gap: 6px;">
            <button id="inviteAccept" style="background:#27ae60; color:white; border:none; border-radius:4px; padding:4px 10px; cursor:pointer;">✅ Accepter</button>
            <button id="inviteDecline" style="background:#e74c3c; color:white; border:none; border-radius:4px; padding:4px 10px; cursor:pointer;">❌ Refuser</button>
        </div>
    `;

        chatPanel.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translateY(0)';
        }, 10);

        document.getElementById('inviteAccept').onclick = () => {
            socket.emit('acceptPrivateInvite', { fromPseudo: data.from, toPseudo: user.pseudo });
            popup.remove();
            alert(`💬 Chat privé ouvert avec ${data.from} !`);
        };

        document.getElementById('inviteDecline').onclick = () => {
            socket.emit('declinePrivateInvite', { fromPseudo: user.pseudo, toPseudo: data.from });
            popup.remove();
        };
    });
});