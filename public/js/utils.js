// ========== FICHIER utils.js ==========

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getOrientationSymbol(tendencies) {
    if (tendencies === 'A') return '▲';
    if (tendencies === 'P') return '▼';
    return '▲▼';
}

function getOrientationText(tendencies) {
    if (tendencies === 'A') return '▲ Actif';
    if (tendencies === 'P') return '▼ Passif';
    return '▲▼ Versatile';
}