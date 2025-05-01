<?php

namespace App\Http\Controllers;

use App\Models\DossierMedical;
use App\Models\ConstanteVitale;
use App\Models\Utilisateur;
use App\Models\Visite;
use App\Models\RendezVous;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DossierMedicalController extends Controller
{




    // ***************Crerr un numero unique pour chaque dosiier medical creer
    private function getNextNumeroDossier()
    {
        $lastDossier = DossierMedical::orderBy('idDossier', 'desc')->first();
        $nextNumero = $lastDossier && preg_match('/\d+/', $lastDossier->idDossier, $matches)
            ? intval($matches[0]) + 1
            : 1;

        return 'DM' . str_pad($nextNumero, 6, '0', STR_PAD_LEFT);
    }







     //*************************Crerr un dossier medical */

    public function create(Request $request, $patientId)
    {
        try {
            $patient = Utilisateur::find($patientId);
            if (!$patient || $patient->role !== 'PATIENT') {
                return response()->json(['status' => false, 'message' => 'Patient invalide ou non trouvé'], 404);
            }

            $validator = Validator::make($request->all(), [
                'allergies' => 'nullable|array',
                'antecedents_medicaux' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $data['patientId'] = $patientId;
            $data['idDossier'] = $this->getNextNumeroDossier();

            $dossier = DossierMedical::create($data);

            return response()->json(['status' => true, 'message' => 'Dossier médical créé avec succès', 'data' => $dossier], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erreur lors de la création', 'error' => $e->getMessage()], 500);
        }
    }







    // ***************Mettre à jour un dossier médical
    public function update(Request $request, $id)
    {
        try {
            $dossier = DossierMedical::find($id);
            if (!$dossier) {
                return response()->json(['status' => false, 'message' => 'Dossier non trouvé'], 404);
            }

            $validator = Validator::make($request->all(), [
                'allergies' => 'nullable|array',
                'antecedents_medicaux' => 'nullable|array',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $dossier->update($validator->validated());

            return response()->json(['status' => true, 'message' => 'Dossier mis à jour avec succès', 'data' => $dossier], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erreur lors de la mise à jour', 'error' => $e->getMessage()], 500);
        }
    }






    //*************Afficher un dossier medical */
    public function show($id)
    {
        try {
            $dossier = DossierMedical::with(['patient', 'constantesVitales', 'rendezVous'])->find($id);
            if (!$dossier) {
                return response()->json(['status' => false, 'message' => 'Dossier non trouvé'], 404);
            }

            return response()->json(['status' => true, 'message' => 'Dossier récupéré', 'data' => $dossier], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erreur lors de la récupération', 'error' => $e->getMessage()], 500);
        }
    }







    //**************    Ajouter des constantes vitales dans un dossier medical */
    public function addConstanteVitale(Request $request, $dossierMedicalId)
    {
        try {
            $dossier = DossierMedical::find($dossierMedicalId);
            if (!$dossier || !$dossier->patient || !$dossier->patient->hospitalisation) {
                return response()->json(['status' => false, 'message' => 'Patient non hospitalisé ou dossier invalide'], 400);
            }

            $validator = Validator::make($request->all(), [
                'frequence_cardiaque' => 'required|integer',
                'temperature' => 'required|numeric',
                'periode' => 'required|in:matin,soir',
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $data['dossierMedicalId'] = $dossierMedicalId;

            $exists = ConstanteVitale::where('dossierMedicalId', $dossierMedicalId)
                ->where('periode', $data['periode'])
                ->whereDate('created_at', now()->toDateString())
                ->exists();

            if ($exists) {
                return response()->json(['status' => false, 'message' => 'Déjà enregistré pour cette période aujourd\'hui'], 409);
            }

            $constante = ConstanteVitale::create($data);

            return response()->json(['status' => true, 'message' => 'Constante vitale ajoutée', 'data' => $constante], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }





    //**************Ajouter un rendez-vous dans un dossier medical */
    public function addRendezVous(Request $request, $dossierMedicalId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'patientId' => 'required|exists:mongodb.utilisateurs,_id',
                'medecinId' => 'required|exists:mongodb.utilisateurs,_id',
                'date' => 'required|date',
                'motif' => 'required|string',
                'status' => 'nullable|in:en_attente,confirme,annule,termine'
            ]);

            if ($validator->fails()) {
                return response()->json(['status' => false, 'message' => 'Erreur de validation', 'errors' => $validator->errors()], 422);
            }

            $data = $validator->validated();
            $data['dossierMedicalId'] = $dossierMedicalId;

            $rdv = RendezVous::create($data);

            return response()->json(['status' => true, 'message' => 'Rendez-vous ajouté', 'data' => $rdv], 201);
        } catch (\Exception $e) {
            return response()->json(['status' => false, 'message' => 'Erreur lors de l\'ajout', 'error' => $e->getMessage()], 500);
        }
    }
}
