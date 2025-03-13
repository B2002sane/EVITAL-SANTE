<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PasswordOublier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Utilisateur;

class PasswordOublierController extends Controller
{
    /**
     * Étape 1 : Envoi de l'email avec un token
     */public function sendResetLink(Request $request)
{
    $request->validate(['email' => 'required|email']);

    $user = Utilisateur::where('email', $request->email)->first();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non trouvé'], 404);
    }

    // Générer un token unique
    $token = Str::random(60);
 
    // Sauvegarder le token dans MongoDB avec la date de création
    PasswordOublier::updateOrCreate(
        ['email' => $user->email],
        ['token' => Hash::make($token), 'created_at' => Carbon::now()]
    );

    // Créer le lien de réinitialisation
    
    $resetLink = 'http://localhost:4200/reset-password?token=' . $token . '&email=' . urlencode($user->email);
   
    // Envoyer l'email avec le lien de réinitialisation
    Mail::html("Bonjour $user->nom $user->prenom,<br><br>Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant : <a href='$resetLink'>Réinitialiser le mot de passe</a><br><br>Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email.", function ($message) use ($user) {
        $message->to($user->email)
               ->subject('Réinitialisation de mot de passe');
    });

    return response()->json(['message' => 'Email de réinitialisation envoyé']);
}
public function resetPassword(Request $request)
{
    // Valider les données de la requête
    $request->validate([
        'email' => 'required|email',
        'token' => 'required|string',
        'password' => 'required|string|min:8|confirmed',
    ]);

    // Rechercher l'entrée correspondante dans la table PasswordOublier
    $passwordReset = PasswordOublier::where('email', $request->email)->first();

    // Vérifier si le token est valide
    if (!$passwordReset || !Hash::check($request->token, $passwordReset->token)) {
        return response()->json(['message' => 'Token invalide ou expiré'], 400);
    }

    // Vérifier si le token a expiré (par exemple, après 1 heure)
    $tokenExpiration = Carbon::parse($passwordReset->created_at)->addHour();
    if (Carbon::now()->gt($tokenExpiration)) {
        return response()->json(['message' => 'Le token a expiré'], 400);
    }

    // Mettre à jour le mot de passe de l'utilisateur
    $user = Utilisateur::where('email', $request->email)->first();
    if (!$user) {
        return response()->json(['message' => 'Utilisateur non trouvé'], 404);
    }

    $user->password = Hash::make($request->password);
    $user->save();

    // Supprimer l'entrée de réinitialisation de mot de passe
    $passwordReset->delete();

    return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
}

}
