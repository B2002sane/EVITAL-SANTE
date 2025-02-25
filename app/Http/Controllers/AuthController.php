
<?php
/*
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use App\Models\Utilisateur;

class AuthController extends Controller
{
    /**
     * Connexion de l'utilisateur
     */
 /*   public function login(Request $request)
    {
        try {
            // Validation des données
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ], [
                'required' => 'Le champ :attribute est obligatoire',
                'email' => 'Le format de l\'email est invalide',
                'min' => 'Le champ :attribute doit contenir au moins :min caractères',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérification des informations d'identification
            $credentials = $request->only('email', 'password');
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Identifiants invalides'
                ], 401);
            }

            // Récupérer les informations de l'utilisateur
            $utilisateur = Utilisateur::where('email', $request->email)->first();

            return response()->json([
                'status' => true,
                'message' => 'Connexion réussie',
                'data' => [
                    'token' => $token,
                    'id' => $utilisateur->id,
                    'nom' => $utilisateur->nom,
                    'prenom' => $utilisateur->prenom,
                    'role' => $utilisateur->role,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de la connexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

