const fs = require('fs');
const { createCanvas } = require('canvas');

// Tailles requises pour la PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Couleurs
const bgColor = '#667eea';
const envelopeColor = '#ffffff';
const flapColor = '#ffffff';

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync('./public/icons')) {
    fs.mkdirSync('./public/icons', { recursive: true });
}

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fond
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Dessiner l'enveloppe
    const padding = size * 0.15;
    const w = size - (padding * 2);
    const h = w * 0.7;
    const x = padding;
    const y = (size - h) / 2;

    ctx.fillStyle = envelopeColor;
    ctx.fillRect(x, y, w, h);

    // Rabat de l'enveloppe (triangle)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.lineTo(x + w, y);
    ctx.fillStyle = flapColor;
    ctx.fill();

    // Contour
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = size * 0.02;
    ctx.strokeRect(x, y, w, h);

    // Cercle du sceau (optionnel)
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w * 0.12, 0, 2 * Math.PI);
    ctx.fillStyle = bgColor;
    ctx.fill();

    // Sauvegarder
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./public/icons/icon-${size}.png`, buffer);
    console.log(`✅ Généré : icon-${size}.png`);
});

console.log('🎉 Toutes les icônes ont été générées !');