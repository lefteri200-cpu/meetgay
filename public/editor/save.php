<?php
$upload_dir = '/root/meetgay/public/pages/';
$html = isset($_POST['html']) ? $_POST['html'] : '';

if (empty($html)) {
    http_response_code(400);
    die('Erreur: Aucun contenu HTML reçu');
}

$filename = 'page-' . time() . '.html';
$filepath = $upload_dir . $filename;

if (file_put_contents($filepath, $html)) {
    echo "Fichier sauvegardé : $filename";
} else {
    http_response_code(500);
    echo "Erreur lors de l'écriture du fichier";
}
