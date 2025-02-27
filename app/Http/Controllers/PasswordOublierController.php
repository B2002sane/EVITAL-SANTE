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
     */
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = Utilisateur::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Générer un token unique
        $token = Str::random(60);

        // Sauvegarder le token dans MongoDB
        PasswordOublier::updateOrCreate(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => Carbon::now()]
        );

        // Envoyer l'email avec le lien de réinitialisation
        Mail::raw("$user->nom  , $user->prenom  Votre code de réinitialisation est : $token   Merci de cliquer sur le lien suivant: ", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Réinitialisation de mot de passe');
        });

        return response()->json(['message' => 'Email de réinitialisation envoyé']);
    }




    /**
     * Étape 2 : Vérification du token et réinitialisation du mot de passe
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $resetToken = PasswordOublier::where('email', $request->email)->first();
        if (!$resetToken || !Hash::check($request->token, $resetToken->token)) {
            return response()->json(['message' => 'Token invalide'], 400);
        }

        // Mettre à jour le mot de passe
        $user = Utilisateur::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le token après usage
        $resetToken->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
}
