const express = require('express');
const cors = require('cors');
const app = express();

// Autoriser le site web à se connecter au serveur et activer la lecture du JSON
app.use(cors());
app.use(express.json());

// Définir le port (Render fournit un port dynamique via process.env.PORT, sinon 3000 en local)
const PORT = process.env.PORT || 3000;

// Variables globales pour stocker temporairement les dernières données reçues
let historiqueDonnees = [];

// ==========================================
// 1. ROUTE POUR L'ESP32 (Envoi de données via 4G/5G)
// ==========================================
app.post('/api/meteo', (req, res) => {
    const { temperature, humidite, pression, vent, luminosite } = req.body;

    // Création de l'objet mesure avec l'heure actuelle du serveur
    const nouvelleMesure = {
        temperature: parseFloat(temperature),
        humidite: parseFloat(humidite),
        pression: parseFloat(pression),
        vitesseVent: vent ? parseFloat(vent) : null,
        luminosite: luminosite ? parseFloat(luminosite) : null,
        date: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })
    };

    // Ajouter la mesure au début de l'historique
    historiqueDonnees.unshift(nouvelleMesure);

    // Optionnel : Limiter l'historique en mémoire aux 100 dernières mesures pour ne pas saturer
    if (historiqueDonnees.length > 100) {
        historiqueDonnees.pop();
    }

    console.log("Nouvelle mesure reçue de l'ESP32 :", nouvelleMesure);
    
    // Répondre à l'ESP32 que tout s'est bien passé
    res.status(200).json({ message: "Données reçues avec succès !" });
});

// ==========================================
// 2. ROUTE POUR LE SITE WEB (Lecture des données)
// ==========================================
app.get('/api/meteo/historique', (req, res) => {
    // Renvoie tout l'historique pour les graphiques de Marguerite et Clem
    res.status(200).json(historiqueDonnees);
});

app.get('/api/meteo/temps-reel', (req, res) => {
    // Renvoie uniquement la toute dernière mesure pour l'affichage principal du site
    if (historiqueDonnees.length > 0) {
        res.status(200).json(historiqueDonnees[0]);
    } else {
        res.status(404).json({ message: "Aucune donnée disponible pour le moment." });
    }
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur météo actif sur le port ${PORT}`);
});