// ui.js - Gestion de l'interface utilisateur (messages, bio, enveloppe)

let currentReceivedMessage = null;
let currentReceivedFrom = null;

function displayMessage(text, type, fromPseudo = null, targetName = null) {
    const messageArea = document.getElementById('messageArea');
    if (!messageArea) return;

    messageArea.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'current-message';

    if (type === 'received') {
        div.innerHTML = `<strong>✉️ ${escapeHtml(fromPseudo)} :</strong> ${escapeHtml(text)}`;
        div.style.background = '#fff0e0';
        div.style.padding = '15px';
        div.style.borderRadius = '12px';
        currentReceivedMessage = text;
        currentReceivedFrom = fromPseudo;
    } else if (type === 'sent') {
        div.innerHTML = `<strong>📤 Vous → ${escapeHtml(targetName)} :</strong> ${escapeHtml(text)}`;
        div.style.background = '#e0f0ff';
        div.style.padding = '15px';
        div.style.borderRadius = '12px';
        currentReceivedMessage = null;
        currentReceivedFrom = null;
    }

    messageArea.appendChild(div);
}

function clearMessageArea() {
    const messageArea = document.getElementById('messageArea');
    const t = window.chatT || { emptyMessage: "💬 En attente de message..." };
    if (messageArea) {
        messageArea.innerHTML = `<div class="empty-message">${t.emptyMessage}</div>`;
    }
    currentReceivedMessage = null;
    currentReceivedFrom = null;
}

function showContactInfo(pseudo, age, gender, orientation, location, purpose, bio) {
    const contactInfoDiv = document.getElementById('contactInfo');
    const contactNameSpan = document.getElementById('contactName');
    const contactAgeSpan = document.getElementById('contactAge');
    const contactGenderSpan = document.getElementById('contactGender');
    const contactOrientationSpan = document.getElementById('contactOrientation');
    const contactPurposeDiv = document.getElementById('contactPurpose');
    const contactBioSpan = document.getElementById('contactBio');
    const t = window.chatT || {
        noBio: "Pas de présentation",
        iAmHereFor: "🎯 Je suis ici pour :"

        
    };

    const existingBio = document.getElementById('contactBio')?.innerText;
    if (existingBio && existingBio !== "Pas de présentation" && existingBio !== "Aucune présentation") {
        bio = existingBio;
    }

    if (!contactInfoDiv) return;

    contactInfoDiv.style.display = 'block';
    if (contactNameSpan) contactNameSpan.innerText = pseudo;
    if (contactAgeSpan) contactAgeSpan.innerText = age || '?';

    
    if (window.privateChatAvailable && window.privateChatAvailable[pseudo]) {
        if (typeof showPrivateChatButton === 'function') {
            showPrivateChatButton(pseudo);
        }
    }

    // Traduction du genre
    let genderText = '';
    if (gender === 'H') genderText = (window.chatLang === 'fr' ? 'Gay' : 'Gay');
    else if (gender === 'F') genderText = (window.chatLang === 'fr' ? 'Hétéro' : 'Hetero');
    else if (gender === 'T') genderText = (window.chatLang === 'fr' ? 'Transgenre' : 'Transgender');
    if (contactGenderSpan) contactGenderSpan.innerText = genderText;

    // Traduction de l'orientation
    const orientationText = getOrientationText(orientation);
    if (contactOrientationSpan) contactOrientationSpan.innerText = orientationText;

    // Traduction du purpose
    let purposeText = '';
    if (purpose === 'meeting') purposeText = (window.chatLang === 'fr' ? '💬 Rencontre' : '💬 Ontmoeting');
    else if (purpose === 'flirt') purposeText = (window.chatLang === 'fr' ? '😘 Flirt' : '😘 Flirt');
    else if (purpose === 'adultery') purposeText = (window.chatLang === 'fr' ? '💔 Relation sexuelle' : '💔 Seksuele relatie');
    if (contactPurposeDiv) contactPurposeDiv.innerHTML = `${t.iAmHereFor} ${purposeText}`;

    // Bio
    if (contactBioSpan) contactBioSpan.innerText = bio || t.noBio;
}

function hideContactInfo() {
    const contactInfoDiv = document.getElementById('contactInfo');
    if (contactInfoDiv) contactInfoDiv.style.display = 'none';
}

function updateEnvelope(pendingCount) {
    const envelope = document.getElementById('envelope');
    if (!envelope) return;

    if (pendingCount > 0) {
        envelope.style.display = 'flex';
        const oldBadge = envelope.querySelector('.pending-badge');
        if (oldBadge) oldBadge.remove();
        const badge = document.createElement('span');
        badge.className = 'pending-badge';
        badge.textContent = pendingCount;
        envelope.appendChild(badge);
    } else {
        envelope.style.display = 'none';
    }
}

function startBlinking() {
    const envelope = document.getElementById('envelope');
    if (envelope) envelope.classList.add('blinking');
}

function stopBlinking() {
    const envelope = document.getElementById('envelope');
    if (envelope) envelope.classList.remove('blinking');
}

