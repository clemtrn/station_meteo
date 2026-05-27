// Importe les outils nécessaires
const express = require('express'); // chercher la bibliothèque Express qui permet de créer des routes API
const cors = require('cors'); // chercher le package CORS qui donnera l'autorisation au site de lire les données
const app = express(); //crée une instance d'express nommée app

// Autoriser le site web à se connecter au serveur et activer la lecture du JSON
app.use(cors()); //on active la sécurité CORS
app.use(express.json()); //commande qui va traduire le texte JSON reçu en un objet JavaScript 

// Définir le port (la porte d'entrée numérique) (Render fournit un port dynamique via process.env.PORT, sinon 3000 en local)
const PORT = process.env.PORT || 3000;

// Variables globales pour stocker temporairement les dernières données reçues
let historiqueDonnees = []; //crée un tableau vide


// 1. ROUTE POUR L'ESP32 (Envoi de données via 4G/5G)

app.post('/api/meteo', (req, res) => {
    const { temperature, humidite, pression, luminosite } = req.body; // va chercher les valeurs envoyées par l'ESP32

    // Création de l'objet mesure avec l'heure actuelle du serveur qui s'assure à chaque fois que les données sont bien des float
    const nouvelleMesure = {
        temperature: parseFloat(temperature),
        humidite: parseFloat(humidite),
        pression: parseFloat(pression),
        luminosite:  parseFloat(luminosite),
        date: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) // ajout de la date et heure au moment où il reçoit la mesure
    };

    historiqueDonnees.unshift(nouvelleMesure); // ajoute la mesure au début du tableau crée avant (l'historique)

   // limite l'historique en mémoire aux 100 dernières mesures pour ne pas saturer en supprimant la plus vieille au cas où
    if (historiqueDonnees.length > 100) {
        historiqueDonnees.pop();
    }

    console.log("Nouvelle mesure reçue de l'ESP32 :", nouvelleMesure); //affiche le message dans la console
    

    res.status(200).json({ message: "Données reçues avec succès !" }); // répond à l'ESP32 que tout s'est bien passé
});


// 2. ROUTE POUR LE SITE WEB (Lecture des données)

app.get('/api/meteo/historique', (req, res) => {
    res.status(200).json(historiqueDonnees); // renvoie tout l'historique pour le site
});

app.get('/api/meteo/temps-reel', (req, res) => {
    // renvoie uniquement la toute dernière mesure pour l'affichage principal du site
    // 200: succès le tableau contient les données, 404: not found les données ne sont pas disponibles
    if (historiqueDonnees.length > 0) {
        res.status(200).json(historiqueDonnees[0]);
    } else {
        res.status(404).json({ message: "Aucune donnée disponible pour le moment." });
    }
});

// Lancement du serveur sur le port spécifié
app.listen(PORT, () => {
    console.log(`Serveur météo actif sur le port ${PORT}`);
});