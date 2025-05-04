<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PasswordOublier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\Utilisateur;

class PasswordOublierController extends Controller
{
    /**
     * Étape 1 : Envoi de l'email avec un OTP
     */
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = Utilisateur::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Générer un code OTP à 6 chiffres
        $otp = rand(100000, 999999);

        // Sauvegarder l'OTP et la date d'expiration dans MongoDB
        PasswordOublier::updateOrCreate(
            ['email' => $user->email],
            [
                'otp' => Hash::make($otp),
                'created_at' => Carbon::now(),
                'otp_expires_at' => Carbon::now()->addMinutes(10)
            ]
        );

        // Envoyer l'email avec l'OTP
        Mail::raw("Bonjour {$user->prenom} {$user->nom}, votre code OTP pour réinitialiser votre mot de passe est : {$otp}. Il est valable 10 minutes.", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Code OTP de réinitialisation de mot de passe');
        });

        return response()->json(['message' => 'Code OTP envoyé par email']);
    }

    /**
     * Étape 2 : Vérification de l’OTP et réinitialisation du mot de passe
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $reset = PasswordOublier::where('email', $request->email)->first();

        if (
            !$reset ||
            !Hash::check($request->otp, $reset->otp) ||
            Carbon::now()->gt(Carbon::parse($reset->otp_expires_at))
        ) {
            return response()->json(['message' => 'OTP invalide ou expiré'], 400);
        }

        $user = Utilisateur::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        $reset->delete(); // Supprimer l'OTP après utilisation

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
}
