<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rendez-vous avec votre médecin</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Votre rendez-vous médical</h2>
    </div>

    <div class="content">
        <p>Bonjour {{ $rendezVous->patient?->prenom ?? 'patient' }},</p>
        
        <p>Votre rendez-vous avec le médecin {{ $rendezVous->medecin?->prenom ?? '' }} {{ $rendezVous->medecin?->nom ?? '' }} a été programmé pour le {{ date('d/m/Y H:i', strtotime($rendezVous->date)) }}.</p>
        
        <p><strong>Motif:</strong> {{ $rendezVous->motif }}</p>

        <p>Si vous avez des questions, veuillez contacter votre médecin.</p>
    </div>

    <div class="footer">
        <p>Merci et à bientôt !</p>
    </div>
</body>
</html>