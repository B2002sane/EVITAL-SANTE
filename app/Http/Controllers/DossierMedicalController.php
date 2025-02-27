<?php

namespace App\Http\Controllers;

use App\Models\DossierMedical;
use App\Models\ConstanteVitale;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\RendezVous;


class DossierMedicalController extends Controller
{
  
        // Générer un numéro de dossier médical unique
        private function getNextNumeroDossier()
        {
            $lastDossier = DossierMedical::orderBy('numeroDossier', 'desc')->first();
    
            if ($lastDossier) {
                // Extraire la partie numérique du numéro de dossier
                $lastNumber = (int) substr($lastDossier->numeroDossier, 2);
                $nextNumero = $lastNumber + 1;
            } else {
                $nextNumero = 1;
            }
    
            return 'DM' . str_pad($nextNumero, 6, '0', STR_PAD_LEFT);
        }

    
        // Créer un dossier médical
        public function create(Request $request, $patientId)
        {
            try {
                // Récupérer les informations du patient
                $patient = Utilisateur::find($patientId);
                if (!$patient) {
                    return response()->json(['status' => false, 'message' => 'Patient non trouvé'], 404);
                }
    
                // Vérifier que le patient a le rôle "patient"
                if ($patient->role !== 'PATIENT') {
                    return response()->json(['status' => false, 'message' => 'Seuls les patients peuvent avoir un dossier médical'], 403);
                }
    
                $validator = Validator::make($request->all(), [
                   // 'poids' => 'required|integer',
                    'prescriptions' => 'nullable|string',
                    'taille' => 'required|numeric',
                    'derniereVisite' => 'nullable|date',
                    //'sexe' => 'required|string',
                    'groupeSanguin' => 'required|string',
                    'dateNaissance' => 'required|date',
                    'maladies' => 'nullable|string',
                ]);
    
                if ($validator->fails()) {
                    return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
                }
    
                $data = $validator->validated();
                $data['patientId'] = $patientId;
                $data['numeroDossier'] = $this->getNextNumeroDossier();
                $data['nom'] = $patient->nom;
                $data['prenom'] = $patient->prenom;
    
                // Inclure les informations sur la chambre et le lit si le patient est hospitalisé
                if ($patient->hospitalisation) {
                    $data['numeroChambre'] = $patient->chambreId ?? null;
                    $data['numeroLit'] = $patient->litNumero ?? null;
                }
    
                $dossierMedical = DossierMedical::create($data);
    
                return response()->json(['status' => true, 'message' => 'Dossier médical enregistré avec succès', 'data' => $dossierMedical], 201);
    
            } catch (\Exception $e) {
                return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de l\'enregistrement', 'error' => $e->getMessage()], 500);
            }
        }
    
        // Mettre à jour un dossier médical
        public function update(Request $request, $id)
        {
            try {
                $dossierMedical = DossierMedical::find($id);
    
                if (!$dossierMedical) {
                    return response()->json(['status' => false, 'message' => 'Dossier médical non trouvé'], 404);
                }
    
                // Vérifier que le patient associé au dossier a le rôle "patient"
                $patient = Utilisateur::find($dossierMedical->patientId);
                if ($patient->role !== 'PATIENT') {
                    return response()->json(['status' => false, 'message' => 'Seuls les patients peuvent avoir un dossier médical'], 403);
                }
    
                $validator = Validator::make($request->all(), [
                    //'poids' => 'integer',
                    'prescriptions' => 'nullable|string',
                    'taille' => 'numeric',
                    'derniereVisite' => 'date',
                   // 'sexe' => 'string',
                    'groupeSanguin' => 'string',
                    'dateNaissance' => 'date',
                    'maladies' => 'nullable|string',
                    'numeroChambre' => 'nullable|string',
                    'numeroLit' => 'nullable|integer',
                ]);
    
                if ($validator->fails()) {
                    return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
                }
    
                $data = $validator->validated();
    
                // Inclure les informations sur la chambre et le lit si le patient est hospitalisé
                if ($patient->hospitalisation) {
                    $data['numeroChambre'] = $request->numeroChambre ?? $dossierMedical->numeroChambre;
                    $data['numeroLit'] = $request->numeroLit ?? $dossierMedical->numeroLit;
                }
    
                $dossierMedical->update($data);
    
                return response()->json(['status' => true, 'message' => 'Dossier médical mis à jour avec succès', 'data' => $dossierMedical], 200);
    
            } catch (\Exception $e) {
                return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de la mise à jour', 'error' => $e->getMessage()], 500);
            }
        }
    
        // Afficher un dossier médical
        public function show($id)
        {
            try {
                $dossierMedical = DossierMedical::with(['constantesVitales'])->find($id);
    
                if (!$dossierMedical) {
                    return response()->json(['status' => false, 'message' => 'Dossier médical non trouvé'], 404);
                }
    
                return response()->json(['status' => true, 'message' => 'Dossier médical récupéré avec succès', 'data' => $dossierMedical], 200);
    
            } catch (\Exception $e) {
                return response()->json(['status' => false, 'message' => 'Une erreur est survenue', 'error' => $e->getMessage()], 500);
            }
        }
    
        // Ajouter des constantes vitales
        public function addConstanteVitale(Request $request, $dossierMedicalId)
        {
            try {
                $validator = Validator::make($request->all(), [
                    'frequencyCardiaque' => 'required|integer',
                    'temperatureCorporelle' => 'required|numeric',
                    'periode' => 'required|in:matin,soir',
                ]);
    
                if ($validator->fails()) {
                    return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
                }
    
                $data = $validator->validated();
                $data['dossierMedicalId'] = $dossierMedicalId;
    
                // Vérifier si une constante vitale existe déjà pour la période donnée
                $existingConstante = ConstanteVitale::where('dossierMedicalId', $dossierMedicalId)
                                                    ->where('periode', $data['periode'])
                                                    ->whereDate('created_at', today())
                                                    ->first();
    
                if ($existingConstante) {
                    return response()->json(['status' => false, 'message' => 'Constante vitale déjà enregistrée pour cette période'], 400);
                }
    
                $constanteVitale = ConstanteVitale::create($data);
    
                return response()->json(['status' => true, 'message' => 'Constante vitale enregistrée avec succès', 'data' => $constanteVitale], 201);
    
            } catch (\Exception $e) {
                return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de l\'enregistrement', 'error' => $e->getMessage()], 500);
            }
        }
    
    
    
    
    // Ajouter un rendez-vous
    public function addRendezVous(Request $request, $dossierMedicalId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'patientId' => 'required|exists:mongodb.utilisateurs,_id',
                'medecinId' => 'required|exists:mongodb.utilisateurs,_id',
                'date' => 'required|date',
                'motif' => 'required|string',
                'status' => 'sometimes|string|in:en_attente,confirme,annule,termine'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $data['dossierMedicalId'] = $dossierMedicalId;

            $rendezVous = RendezVous::create($data);

            return response()->json(['status' => true, 'message' => 'Rendez-vous enregistré avec succès', 'data' => $rendezVous], 201);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Une erreur est survenue lors de l\'enregistrement', 'error' => $e->getMessage()], 500);
        }
    }
}