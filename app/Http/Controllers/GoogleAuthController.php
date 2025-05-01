<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class GoogleAuthController extends Controller
{
    public function redirectToGoogle()
    {
        $query = http_build_query([
            'client_id' => env('GOOGLE_CLIENT_ID'),
            'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'access_type' => 'offline',
            'prompt' => 'consent'
        ]);

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function handleGoogleCallback()
    {
        $code = request('code');

        // Échanger le code contre un token
        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => env('GOOGLE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
            'grant_type' => 'authorization_code',
            'code' => $code,
        ]);

        $accessToken = $response->json()['access_token'];

        // Récupérer les infos utilisateur
        $googleUser = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v2/userinfo')->json();

        // Trouver ou créer un utilisateur dans MongoDB
        $user = Utilisateur::firstOrCreate(
            ['email' => $googleUser['email']],
            [
                'nom' => $googleUser['family_name'] ?? '',
                'prenom' => $googleUser['given_name'] ?? '',
                'photo' => $googleUser['picture'] ?? null,
                'email' => $googleUser['email'],
                'role' => 'MEDECIN',
                'password' => bcrypt(Str::random(16)), // mot de passe aléatoire
                'status' => true,
            ]
        );

        // Générer un JWT
        $token = JWTAuth::fromUser($user);

        // Rediriger vers le front (Angular)
        return redirect("http://localhost:4200/login?token=$token");
    }
}
