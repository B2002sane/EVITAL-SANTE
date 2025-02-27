<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Nouveau rendez-vous créé</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #3498db;
        }
        ul {
            padding-left: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Nouveau rendez-vous médical</h1>
        
        <p>Bonjour {{ $rendezVous->patient->nom }} {{ $rendezVous->patient->prenom }},</p>
        
        <p>Un rendez-vous a été planifié avec Dr. {{ $medecin->nom }} {{ $medecin->prenom }}.</p>
        
        <h2>Détails du rendez-vous :</h2>
        <ul>
            <li><strong>Date :</strong> {{ date('d/m/Y H:i', strtotime($date)) }}</li>
            <li><strong>Motif :</strong> {{ $motif }}</li>
        </ul>
        
        <p>En cas d'empêchement, veuillez nous contacter dès que possible.</p>
        
        <div class="footer">
            <p>Cordialement,<br>
            L'équipe de la clinique</p>
        </div>
    </div>
</body>
</html>