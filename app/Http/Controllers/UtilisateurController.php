<?php

namespace App\Http\Controllers;



use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class UtilisateurController extends Controller
{



//connexion d'un utilisateur avec token email et mot de passe pour une base de donnees mongodb
    public function login(Request $request)
    {
        try {
            // Validation des données
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string'
            ], [
                'required' => 'Le champ :attribute est obligatoire',
                'email' => 'Le format de l\'email est invalide'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Récupération de l'utilisateur
            $utilisateur = Utilisateur::where('email', $request->email)->first();

            if (!$utilisateur || !Hash::check($request->password, $utilisateur->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            // Générer un token d'authentification
            $token = $utilisateur->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'Connexion réussie',
                'data' => [
                    'utilisateur' => $utilisateur,
                    'token' => $token
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




    /**
     * Générer un matricule unique
     */
    public function generateMatricule()
    {
        do {
            // Génère un matricule de format MATH-XXXXX (où X sont des caractères alphanumériques)
            $matricule = 'MATH-' . strtoupper(Str::random(5));
        } while (Utilisateur::where('matricule', $matricule)->exists()); // Vérifie si le matricule existe déjà

        return $matricule;
    }




    /**
     * Afficher la liste des utilisateurs avec les statistiques
     */
    public function index()
    {
        try {
            // Récupération des utilisateurs non archivés
            $utilisateurs = Utilisateur::where('archive', false)->get();

            // Calcul des statistiques
            $stats = [
                'total_patients' => Utilisateur::where('role', 'PATIENT')->where('archive', false)->count(),
                'total_donneurs' => Utilisateur::where('role', 'DONNEUR')->where('archive', false)->count(),
                'total_medecins' => Utilisateur::where('role', 'MEDECIN')->where('archive', false)->count(),
                'total_medecins_chef' => Utilisateur::where('role', 'MEDECIN_CHEF')->where('archive', false)->count(),
                'total_utilisateurs' => $utilisateurs->count()
            ];

            // Masquer le mot de passe pour chaque utilisateur
            $utilisateurs = $utilisateurs->map(function ($utilisateur) {
                $utilisateur->makeHidden(['password', 'remember_token']);
                return $utilisateur;
            });

            return response()->json([
                'status' => true,
                'message' => 'Liste des utilisateurs récupérée avec succès',
                'statistiques' => $stats,
                'data' => $utilisateurs
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouvel utilisateur
     */
    public function store(Request $request)
    {
        try {
            // Validation des données
            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'telephone' => 'required|string|unique:utilisateurs,telephone',
                'email' => 'required|email|unique:utilisateurs,email',
                'password' => 'required|string|min:6',
                'role' => ['required', Rule::in(['PATIENT', 'MEDECIN', 'MEDECIN_CHEF', 'DONNEUR'])],
                'genre' => ['required', Rule::in(['HOMME', 'FEMME'])],
    
                'photo' => 'nullable|string',

                // Validation conditionnelle selon le rôle
                'dateNaissance' => 'required_if:role,PATIENT|date|nullable',
                'groupeSanguin' => [
                    'required_if:role,PATIENT,DONNEUR',
                    Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
                ],
                'categorie' => [
                    'required_if:role,PATIENT',
                    Rule::in(['FEMME_ENCEINTE', 'PERSONNE_AGEE', 'MALADE_CHRONIQUE'])
                ],
                'poids' => 'nullable|numeric|min:0',
                'codeRfid' => 'required_if:role,MEDECIN,MEDECIN_CHEF|string|unique:utilisateurs,codeRfid|nullable',
            ], [
                'required' => 'Le champ :attribute est obligatoire',
                'email' => 'Le format de l\'email est invalide',
                'unique' => 'Ce :attribute existe déjà',
                'min' => 'Le champ :attribute doit contenir au moins :min caractères',
                'in' => 'La valeur sélectionnée pour :attribute est invalide',
                'numeric' => 'Le champ :attribute doit être un nombre',
                'date' => 'Le format de la date est invalide'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Création de l'utilisateur
            $data = $validator->validated();
            $data['password'] = Hash::make($data['password']);
            $data['matricule'] = $this->generateMatricule(); 
            
            $utilisateur = Utilisateur::create($data);
            
           

            return response()->json([
                'status' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $utilisateur
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de la création de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }




    /**
     * Afficher un utilisateur spécifique
     */
    public function show($id)
    {
        try {
            $utilisateur = Utilisateur::find($id);
            
            if (!$utilisateur) {
                return response()->json([
                    'status' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Masquer le mot de passe
            $utilisateur->makeHidden(['password', 'remember_token']);

            return response()->json([
                'status' => true,
                'message' => 'Utilisateur récupéré avec succès',
                'data' => $utilisateur
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        try {
            $utilisateur = Utilisateur::find($id);
            
            if (!$utilisateur) {
                return response()->json([
                    'status' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Validation des données
            $validator = Validator::make($request->all(), [
                'nom' => 'string|max:255',
                'prenom' => 'string|max:255',
                'telephone' => ['string', Rule::unique('utilisateurs')->ignore($id)],
                'email' => ['email', Rule::unique('utilisateurs')->ignore($id)],
                'password' => 'nullable|string|min:6',
                'role' => [Rule::in(['PATIENT', 'MEDECIN', 'MEDECIN_CHEF', 'DONNEUR'])],
                'genre' => [Rule::in(['HOMME', 'FEMME'])],
                'photo' => 'nullable|string',
                'dateNaissance' => 'date|nullable',
                'groupeSanguin' => [Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
                'categorie' => [Rule::in(['FEMME_ENCEINTE', 'PERSONNE_AGEE', 'MALADE_CHRONIQUE'])],
                'poids' => 'numeric|min:0|nullable',
                'codeRfid' => ['string', Rule::unique('utilisateurs')->ignore($id), 'nullable'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Hasher le nouveau mot de passe si fourni
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $utilisateur->update($data);
            
            // Masquer le mot de passe dans la réponse
            $utilisateur->makeHidden(['password', 'remember_token']);

            return response()->json([
                'status' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $utilisateur
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un utilisateur (suppression logique)
     */
    public function destroy($id)
    {
        try {
            $utilisateur = Utilisateur::find($id);
            
            if (!$utilisateur) {
                return response()->json([
                    'status' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Suppression logique
            $utilisateur->update(['archive' => true]);

            return response()->json([
                'status' => true,
                'message' => 'Utilisateur supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}