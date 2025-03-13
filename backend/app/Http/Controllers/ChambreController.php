<?php

namespace App\Http\Controllers;


use App\Models\Chambre;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChambreController extends Controller
{
    /**
     * Afficher toutes les chambres
     */
    public function index(Request $request)
    {
        $query = Chambre::query();

        // Filtrer par disponibilité
        if ($request->has('disponible')) {
            $query->where('disponible', $request->boolean('disponible'));
        }

        // Filtrer par nombre de lits minimum
        if ($request->has('litsMin')) {
            $query->where('nombreLits', '>=', $request->litsMin);
        }

        $chambres = $query->with('patients')->get();
        return response()->json(['chambres' => $chambres]);
    }




    /**
     * Créer une nouvelle chambre
     */
  
        public function store(Request $request)
    {
        // Règles de validation
        $rules = [
            'numero' => 'required|string|unique:chambres,numero',
            'nombreLits' => 'required|integer|min:1'
        ];

        // Messages d'erreur personnalisés
        $messages = [
            'numero.required' => 'Le numéro de la chambre est obligatoire.',
            'numero.string' => 'Le numéro de la chambre doit être une chaîne de caractères.',
            'numero.unique' => 'Ce numéro de chambre est déjà utilisé.',
            'nombreLits.required' => 'Le nombre de lits est obligatoire.',
            'nombreLits.integer' => 'Le nombre de lits doit être un nombre entier.',
            'nombreLits.min' => 'Le nombre de lits doit être au moins égal à 1.'
        ];

        // Validation des données
        $validator = Validator::make($request->all(), $rules, $messages);

        // Si la validation échoue, on renvoie les erreurs
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Création de la chambre
        $chambre = Chambre::create([
            'numero' => $request->numero,
            'disponible' => true,
            'nombreLits' => $request->nombreLits
        ]);

        // Initialisation des lits
        $chambre->initialiserLits($request->nombreLits);

        // Réponse JSON
        return response()->json(['chambre' => $chambre], 201);
    }





    /**
     * Afficher une chambre spécifique
     */
    public function show($id)
    {
        $chambre = Chambre::with('patients')->find($id);

        if (!$chambre) {
            return response()->json(['message' => 'Chambre non trouvée'], 404);
        }

        return response()->json(['chambre' => $chambre]);
    }



   /**
 * Mettre à jour une chambre
 */
public function update(Request $request, $id)
{
    $chambre = Chambre::find($id);

    if (!$chambre) {
        return response()->json(['message' => 'Chambre non trouvée'], 404);
    }

    $validator = Validator::make($request->all(), [
        // Supprimer la validation du numéro car il ne devrait pas être modifiable
        'disponible' => 'sometimes|boolean',
        'nombreLits' => 'sometimes|integer|min:1'
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    // Exclure le numéro des champs modifiables
    $chambre->update($request->only(['disponible', 'nombreLits']));

    // Si le nombre de lits est modifié, réinitialiser les lits
    if ($request->has('nombreLits') && $request->nombreLits != $chambre->nombreLits) {
        $chambre->initialiserLits($request->nombreLits);
    }

    return response()->json(['chambre' => $chambre]);
}

    


    /**
     * Supprimer une chambre
     */
    public function destroy($id)
    {
        $chambre = Chambre::find($id);

        if (!$chambre) {
            return response()->json(['message' => 'Chambre non trouvée'], 404);
        }

        if ($chambre->nombreLitsOccupes() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer une chambre occupée'
            ], 422);
        }

        $chambre->delete();
        return response()->json(['message' => 'Chambre supprimée avec succès']);
    }







    /**
     * Assigner un lit à un patient
     */
    public function assignerLit(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'patientId' => 'required|exists:utilisateurs,_id',
            'numeroLit' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $chambre = Chambre::find($id);
        if (!$chambre) {
            return response()->json(['message' => 'Chambre non trouvée'], 404);
        }

        $patient = Utilisateur::find($request->patientId);
        if (!$patient || $patient->role !== 'PATIENT') {
            return response()->json(['message' => 'Patient non valide'], 422);
        }

        if ($patient->hospitalisation) {
            return response()->json(['message' => 'Patient déjà hospitalisé'], 422);
        }

        if ($request->numeroLit > $chambre->nombreLits) {
            return response()->json(['message' => 'Numéro de lit invalide'], 422);
        }

        if ($chambre->assignerLit($request->patientId, $request->numeroLit)) {
            // Mettre à jour le statut d'hospitalisation du patient
            $patient->update([
                'hospitalisation' => true,
                'chambreId' => $chambre->_id
            ]);
            return response()->json([
                'message' => 'Patient assigné avec succès',
                'chambre' => $chambre
            ]);
        }

        return response()->json(['message' => 'Lit déjà occupé'], 422);
    }



    /**
     * Libérer un lit
     */
    public function libererLit(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'numeroLit' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $chambre = Chambre::find($id);
        if (!$chambre) {
            return response()->json(['message' => 'Chambre non trouvée'], 404);
        }

        $lit = collect($chambre->lits)->where('numero', $request->numeroLit)->first();
        if (!$lit) {
            return response()->json(['message' => 'Lit non trouvé'], 404);
        }

        if ($lit['patientId']) {
            // Mettre à jour le statut d'hospitalisation du patient
            $patient = Utilisateur::find($lit['patientId']);
            if ($patient) {
                $patient->update([
                    'hospitalisation' => false,
                    'chambreId' => null
                ]);
            }
        }

        if ($chambre->libererLit($request->numeroLit)) {
            return response()->json([
                'message' => 'Lit libéré avec succès',
                'chambre' => $chambre
            ]);
        }

        return response()->json(['message' => 'Lit déjà libre'], 422);
    }



    /**
     * Obtenir les chambres disponibles
     */
    public function chambresDisponibles()
    {
        $chambres = Chambre::where('disponible', true)->get();
        return response()->json(['chambres' => $chambres]);
    }

    
    /**
     * Obtenir le statut d'occupation d'une chambre
     */
    public function statutOccupation($id)
    {
        $chambre = Chambre::with('patients')->find($id);
        
        if (!$chambre) {
            return response()->json(['message' => 'Chambre non trouvée'], 404);
        }

        return response()->json([
            'chambre' => $chambre->numero,
            'nombreTotalLits' => $chambre->nombreLits,
            'litsOccupes' => $chambre->nombreLitsOccupes(),
            'litsDisponibles' => $chambre->nombreLitsDisponibles(),
            'disponible' => $chambre->disponible,
            'patients' => $chambre->patients
        ]);
    }


        /**
     * Obtenir les patients non hospitalisés
     */
    public function getPatientsNonHospitalises()
    {
        $patients = Utilisateur::where('hospitalisation', false)
                                ->where('role', 'PATIENT')
                                ->get();
    
        if ($patients->isEmpty()) {
            return response()->json(['patients' => []], 200);
        }
    
        return response()->json(['patients' => $patients]);
    }

}