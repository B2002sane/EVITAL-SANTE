<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\Utilisateur;

class AuthController extends Controller
{
    /**
     * Connexion de l'utilisateur
     */
    public function login(Request $request)
    {
        // Validation des données
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tentative de connexion
        $credentials = $request->only('email', 'password');

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }
        } catch (JWTException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Impossible de créer un token'
            ], 500);
        }

        // Récupérer l'utilisateur connecté
        $utilisateur = Utilisateur::where('email', $request->email)->first();
        $utilisateur->makeHidden(['password', 'remember_token']);

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => [
                'id' => $utilisateur->id,
                'nom' => $utilisateur->nom,
                'prenom' => $utilisateur->prenom,
                'role' => $utilisateur->role
            ]
        ], 200);
    }

    //Déconnexion de l'utilisateur
    
   public function logout(Request $request)
   {
       try {
           // Invalider le token JWT actuel
           JWTAuth::invalidate(JWTAuth::getToken());

           return response()->json([
               'status' => true,
               'message' => 'Déconnexion réussie'
           ], 200);

       } catch (JWTException $e) {
           return response()->json([
               'status' => false,
               'message' => 'Erreur lors de la déconnexion',
               'error' => $e->getMessage()
           ], 500);
       }
   }


   public function loginByCard(Request $request)
{
    // Validation des données
    $validator = Validator::make($request->all(), [
        'codeRfid' => 'required|string',
    ], [
        'codeRfid.required' => 'Le champ code RFID est obligatoire.',
        'codeRfid.string' => 'Le champ code RFID doit être une chaîne de caractères.',
        
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'message' => 'Erreur de validation',
            'errors' => $validator->errors()
        ], 422);
    }

    // Récupérer l'utilisateur par son code RFID
    $utilisateur = Utilisateur::where('codeRfid', $request->codeRfid)->first();

    if (!$utilisateur) {
        return response()->json([
            'status' => false,
            'message' => 'Carte RFID non reconnue'
        ], 404);
    }

    // Vérifier si l'utilisateur est actif
    if ($utilisateur->status === false) {
        return response()->json([
            'status' => false,
            'message' => 'Votre compte est désactivé'
        ], 403);
    }

    // Générer un token JWT pour l'utilisateur
    try {
        $token = JWTAuth::fromUser($utilisateur);
    } catch (JWTException $e) {
        return response()->json([
            'status' => false,
            'message' => 'Impossible de créer un token',
            'error' => $e->getMessage()
        ], 500);
    }

    // Masquer le mot de passe dans la réponse
    $utilisateur->makeHidden(['password', 'remember_token']);

    return response()->json([
        'status' => true,
        'message' => 'Connexion réussie',
        'data' => $utilisateur,
        'token' => $token
    ], 200);
}




    public function changePassword(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ], [
            'new_password.confirmed' => 'La confirmation du nouveau mot de passe ne correspond pas.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Récupérer l'utilisateur authentifié via le token JWT
            $user = JWTAuth::parseToken()->authenticate();

            // Vérifier que l'ancien mot de passe est correct
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'L\'ancien mot de passe est incorrect'
                ], 401);
            }

            // Mettre à jour le mot de passe
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Mot de passe mis à jour avec succès'
            ], 200);

        } catch (JWTException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Erreur d\'authentification',
                'error' => $e->getMessage()
            ], 500);
        }
    }






}